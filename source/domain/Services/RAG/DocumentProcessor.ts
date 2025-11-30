import fs from "fs/promises";
import path from "path";
import os from "os";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import pptx2json from "pptx2json";
import ExcelJS from "exceljs";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import computeCosineSimilarity from "compute-cosine-similarity";
import Document from "../../Entity/Document";
import Chunk from "../../Entity/Chunk";

export interface ProcessConfig {
  chunkSize?: number;
  chunkOverlap?: number;
  embeddingModel?: string;
  generationModel?: string;
  summarize?: boolean;
  similarityThreshold?: number;
  batchSize?: number;
}

export type TextChunk = {
  content: string;
  startPosition: number;
  endPosition: number;
};

export class DocumentProcessor {
  private ai: GoogleGenAI;
  private config: Required<ProcessConfig>;

  constructor(ai: GoogleGenAI, config?: ProcessConfig) {
    this.ai = ai;
    this.config = {
      chunkSize: config?.chunkSize ?? 400,
      chunkOverlap: config?.chunkOverlap ?? 50,
      embeddingModel: config?.embeddingModel ?? "text-embedding-004",
      generationModel: config?.generationModel ?? "gemini-2.0-flash-exp",
      summarize: config?.summarize ?? true,
      similarityThreshold: config?.similarityThreshold ?? 0.95,
      batchSize: config?.batchSize ?? 100,
    };
  }

  private async writeTempFile(buffer: Buffer, ext: string): Promise<string> {
    const filename = `docproc_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const tmp = path.join(os.tmpdir(), filename);
    await fs.writeFile(tmp, buffer);
    return tmp;
  }

  private async uploadForModel(buffer: Buffer, mimeType: string): Promise<{ uri: string; mimeType: string }> {
    const ext = mimeType.includes("pdf") ? ".pdf" : mimeType.includes("jpeg") || mimeType.includes("jpg") ? ".jpg" : mimeType.includes("png") ? ".png" : "";
    const tmpPath = await this.writeTempFile(buffer, ext);
    const uploaded = await this.ai.files.upload({ file: tmpPath, config: { mimeType } });
    try {
      await fs.unlink(tmpPath);
    } catch {}
    return { uri: (uploaded as any).uri, mimeType: (uploaded as any).mimeType || mimeType };
  }

  private async multimodalExtract(buffer: Buffer, mimeType: string): Promise<string> {
    const uploaded = await this.uploadForModel(buffer, mimeType);
    const response = await this.ai.models.generateContent({
      model: this.config.generationModel,
      contents: [
        createUserContent([
          "Extraia todo o texto deste arquivo. Mantenha tabelas em formato legível (por exemplo, Markdown) quando possível.",
          createPartFromUri(uploaded.uri, uploaded.mimeType),
        ]),
      ],
    });
    return (response as any).text ?? "";
  }

  private async extractPdf(buffer: Buffer): Promise<string> {
    try {
      const parsed = await pdfParse(buffer);
      const txt = (parsed.text || "").trim();
      if (txt.length > 50) return txt;
    } catch {}
    return await this.multimodalExtract(buffer, "application/pdf");
  }

  private async extractDocx(buffer: Buffer): Promise<string> {
    const r = await mammoth.extractRawText({ buffer });
    const txt = (r.value || "").trim();
    if (txt.length > 20) return txt;
    return await this.multimodalExtract(buffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  }

  private async extractPptx(buffer: Buffer): Promise<string> {
    try {
      const result = await (pptx2json as any).pptxToJson(buffer);
      let out = "";
      for (const slide of result.slides || []) {
        if (slide.text) out += slide.text.join("\n") + "\n";
        if (slide.tables) {
          for (const table of slide.tables) {
            for (const row of table) out += row.join(" | ") + "\n";
          }
        }
        if (slide.notes) out += (Array.isArray(slide.notes) ? slide.notes.join("\n") : slide.notes) + "\n";
      }
      const text = out.trim();
      if (text.length > 20) return text;
    } catch {}
    return await this.multimodalExtract(buffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  }

  private async extractImage(buffer: Buffer, mimeType: string): Promise<string> {
    return await this.multimodalExtract(buffer, mimeType);
  }

  private async extractXlsx(buffer: ExcelJS.Buffer): Promise<string> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      let out = "";
      workbook.eachSheet((sheet) => {
        out += `\nSHEET: ${sheet.name}\n`;
        sheet.eachRow((row) => {
          const values = row.values as any[];
          const rowVals = values.slice(1).map((v) => (v === null || v === undefined ? "" : String(v)));
          out += rowVals.join(" | ") + "\n";
        });
      });
      const text = out.trim();
      if (text.length > 10) return text;
    } catch {}
    return ""; 
  }

  async readFile(filePath: string): Promise<{ content: string; pageCount?: number }> {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
        const content = await this.extractPdf(buffer);
        return { content, pageCount: undefined };
    }

    if (ext === ".docx") {
        const content = await this.extractDocx(buffer);
        return { content };
    }

    if (ext === ".pptx") {
        const content = await this.extractPptx(buffer);
        return { content };
    }

    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
        const mime = ext === ".png" ? "image/png" : "image/jpeg";
        const content = await this.extractImage(buffer, mime);
        return { content };
    }

    if (ext === ".xlsx") {
        const excelBuffer: ExcelJS.Buffer = buffer as unknown as ExcelJS.Buffer;
        const content = await this.extractXlsx(excelBuffer);
        return { content };
    }

    return { content: "" };
    }


  private normalizeText(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  }

  chunkText(text: string): TextChunk[] {
    const clean = this.normalizeText(text);
    if (!clean) return [];
    const words = clean.split(/\s+/);
    const chunks: TextChunk[] = [];
    let start = 0;
    let position = 0;
    while (start < words.length) {
      const end = Math.min(start + this.config.chunkSize, words.length);
      const chunkWords = words.slice(start, end);
      const content = chunkWords.join(" ");
      const startPos = position;
      const endPos = position + content.length;
      chunks.push({ content, startPosition: startPos, endPosition: endPos });
      start += this.config.chunkSize - this.config.chunkOverlap;
      position = endPos + 1;
    }
    return chunks;
  }

  async summarizeText(text: string, title: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.config.generationModel,
        contents: [
          createUserContent([
            `Resuma o seguinte documento (${title}) de forma concisa, mantendo conceitos e tabelas importantes.`,
            text,
          ]),
        ],
      });
      return (response as any).text ?? text;
    } catch {
      return text;
    }
  }

  async summarizeAndChunk(text: string, title: string): Promise<TextChunk[]> {
    const source = this.config.summarize ? await this.summarizeText(text, title) : text;
    return this.chunkText(source);
  }

  async generateEmbeddings(title: string, contents: string[]): Promise<number[][]> {
    const batches: number[][] = [];
    for (let i = 0; i < contents.length; i += this.config.batchSize) {
      const batch = contents.slice(i, i + this.config.batchSize);
      const response = await this.ai.models.embedContent({
        model: this.config.embeddingModel,
        contents: batch,
        config: { taskType: "RETRIEVAL_DOCUMENT", title },
      });
      const emb = ((response as any).embeddings || []).map((e: any) => e.values || e);
      batches.push(...emb);
      if (i + this.config.batchSize < contents.length) await this.delay(200);
    }
    return batches;
  }

  async removeSimilarChunks(chunks: TextChunk[], title: string) {
    if (chunks.length === 0) return [];
    const unique: Array<TextChunk & { embedding: number[] }> = [];
    for (let i = 0; i < chunks.length; i += this.config.batchSize) {
      const batch = chunks.slice(i, i + this.config.batchSize);
      const contents = batch.map((c) => c.content);
      const embeddings = await this.generateEmbeddings(title, contents);
      for (let j = 0; j < batch.length; j++) {
        const current = batch[j];
        const emb = embeddings[j];
        let isDuplicate = false;
        for (const u of unique) {
          const sim = computeCosineSimilarity(emb, u.embedding);
          if (sim !== null && sim >= this.config.similarityThreshold) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) unique.push({ ...current, embedding: emb });
      }
    }
    return unique;
  }

  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async processDocument(filePath: string, bokRoot: string): Promise<{ document: Document; chunks: Chunk[] }> {
    const { content, pageCount } = await this.readFile(filePath);
    const metadata = this.extractMetadata(filePath, bokRoot);
    const fileName = path.basename(filePath, path.extname(filePath));
    const document = new Document({
      title: fileName,
      content,
      source: filePath,
      category: metadata.category,
      section: metadata.section,
      subsection: metadata.subsection,
      pageCount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!content || content.trim().length === 0) return { document, chunks: [] };
    const textChunks = await this.summarizeAndChunk(content, document.title);
    const uniqueChunksWithEmbeddings = await this.removeSimilarChunks(textChunks, document.title);
    const chunks: Chunk[] = uniqueChunksWithEmbeddings.map((chunkData, index) => {
      return new Chunk({
        title: document.title,
        content: chunkData.content,
        embedding: chunkData.embedding,
        documentId: document.id,
        chunkIndex: index,
        startPosition: chunkData.startPosition,
        endPosition: chunkData.endPosition,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return { document, chunks };
  }

  async getFilesRecursively(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return this.getFilesRecursively(full);
        const ext = path.extname(entry.name).toLowerCase();
        if ([".pdf", ".docx", ".pptx", ".jpg", ".jpeg", ".png", ".xlsx"].includes(ext)) return [full];
        return [];
      })
    );
    return files.flat();
  }

  extractMetadata(filePath: string, bokRoot: string) {
    const relative = path.relative(bokRoot, filePath);
    const parts = relative.split(path.sep);
    parts.pop();
    return {
      category: parts[0] || undefined,
      section: parts[1] || undefined,
      subsection: parts[2] || undefined,
    };
  }

  async processDirectory(directoryPath: string): Promise<Array<{ document: Document; chunks: Chunk[] }>> {
    const results: Array<{ document: Document; chunks: Chunk[] }> = [];
    const files = await this.getFilesRecursively(directoryPath);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.processDocument(file, directoryPath);
        results.push(result);
      } catch (error) {}
    }
    return results;
  }
}
