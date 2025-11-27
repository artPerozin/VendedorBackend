import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { OpenAI } from "openai";
import RepositoryFactoryInterface from "../domain/Interfaces/RepositoryFactoryInterface";
import ChunkRepositoryInterface from "../domain/Interfaces/ChunkRepositoryInterface";
import EmbeddingService from "../domain/Services/EmbeddingService";
import { ModelType } from "../domain/Enums/ModelType";
import { TokenType } from "../domain/Enums/TokenType";
import { cosineSimilarity } from "../domain/Services/CosineSimilarity";
import { encoding_for_model } from "tiktoken";
import RemoveStopWordsService from "../domain/Services/removeStopwordsService";
import Chunk from "../domain/Entity/Chunk";

interface ProcessStats {
    totalFiles: number;
    processedFiles: number;
    skippedFiles: number;
    totalChunks: number;
    savedChunks: number;
    duplicateChunks: number;
    errors: number;
}

export default class ImportEmbeddings {
    private repositoryFactory: RepositoryFactoryInterface;
    private chunkRepository: ChunkRepositoryInterface;
    private embeddingService: EmbeddingService;
    private stats: ProcessStats;

    constructor(
        repositoryFactory: RepositoryFactoryInterface,
        openai: OpenAI,
        embeddingService?: EmbeddingService
    ) {
        this.repositoryFactory = repositoryFactory;
        this.chunkRepository = repositoryFactory.createChunkRepository();
        this.embeddingService =
            embeddingService || new EmbeddingService(this.repositoryFactory, openai);
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            skippedFiles: 0,
            totalChunks: 0,
            savedChunks: 0,
            duplicateChunks: 0,
            errors: 0
        };
    }

    async run(inputFolder: string = "./docs", lang: string = "por"): Promise<void> {
        console.log("\n🚀 Iniciando processamento de documentos...\n");
        
        const resolvedPath = path.resolve(inputFolder);

        if (!fs.existsSync(resolvedPath)) {
            console.log(`📁 Criando diretório: ${resolvedPath}`);
            fs.mkdirSync(resolvedPath, { recursive: true });
        }

        const files = fs
            .readdirSync(resolvedPath)
            .filter((f) => f.endsWith(".pdf") || f.endsWith(".txt") || f.endsWith(".docx"));

        this.stats.totalFiles = files.length;

        if (files.length === 0) {
            console.log("⚠️  Nenhum arquivo encontrado para processar.");
            return;
        }

        console.log(`📚 ${files.length} arquivo(s) encontrado(s):\n`);
        files.forEach((f, i) => {
            const ext = path.extname(f).toUpperCase();
            console.log(`   ${i + 1}. ${f} ${this.getFileIcon(ext)}`);
        });
        console.log("");

        const startTime = Date.now();

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const fileName = files[fileIndex];
            await this.processFile(fileName, resolvedPath, lang, fileIndex + 1);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        this.printSummary(duration);
    }

    private async processFile(
        fileName: string,
        resolvedPath: string,
        lang: string,
        fileNumber: number
    ): Promise<void> {
        const filePath = path.join(resolvedPath, fileName);
        const fileExt = path.extname(fileName).toUpperCase();
        
        console.log(`\n${"=".repeat(70)}`);
        console.log(`📄 [${fileNumber}/${this.stats.totalFiles}] Processando: ${fileName}`);
        console.log(`${"=".repeat(70)}\n`);

        let buffer: Buffer;
        try {
            buffer = fs.readFileSync(filePath);
            const sizeInKB = (buffer.length / 1024).toFixed(2);
            console.log(`   📏 Tamanho: ${sizeInKB} KB`);
        } catch (error) {
            console.error(`   ❌ Erro ao ler arquivo: ${error}`);
            this.stats.skippedFiles++;
            this.stats.errors++;
            return;
        }

        let text = "";
        try {
            console.log(`   🔍 Extraindo texto do formato ${fileExt}...`);
            
            if (fileName.endsWith(".pdf")) {
                const data = await pdf(buffer);
                text = data.text || "";
                console.log(`   📖 ${data.numpages} página(s) extraída(s)`);
            } else if (fileName.endsWith(".docx")) {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value || "";
            } else {
                text = buffer.toString("utf-8");
            }

            const charCount = text.length;
            const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
            console.log(`   📊 ${charCount.toLocaleString()} caracteres, ${wordCount.toLocaleString()} palavras`);
        } catch (error) {
            console.error(`   ❌ Erro ao extrair texto: ${error}`);
            this.stats.skippedFiles++;
            this.stats.errors++;
            return;
        }

        if (!text.trim()) {
            console.log("   ⚠️  Arquivo vazio ou sem texto extraível");
            this.stats.skippedFiles++;
            return;
        }

        console.log(`   🧹 Removendo stop words (idioma: ${lang})...`);
        const cleanedText = await RemoveStopWordsService(text, lang);
        
        console.log(`   ✂️  Dividindo em parágrafos e chunks...`);
        const paragraphs = this.splitIntoParagraphs(cleanedText);
        const chunks = this.splitIntoChunks(paragraphs, 500);
        
        console.log(`   📦 ${chunks.length} chunk(s) gerado(s) (max 500 tokens cada)`);
        this.stats.totalChunks += chunks.length;

        console.log(`   🔄 Carregando chunks existentes da base...`);
        const existingChunksRaw = await this.chunkRepository.getAll();
        const existingChunks = existingChunksRaw.map((ec: any) => {
            let emb = ec.embedding;
            if (typeof emb === "string") {
                try { emb = JSON.parse(emb); } catch {}
            }
            return { ...ec, embedding: emb };
        });
        console.log(`   💾 ${existingChunks.length} chunk(s) já existente(s) na base\n`);

        let fileSaved = 0;
        let fileDuplicates = 0;
        let fileErrors = 0;

        console.log(`   🤖 Processando chunks de "${fileName}":\n`);

        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i].trim();
            if (!chunkText) continue;

            const chunkNum = i + 1;
            const preview = chunkText.substring(0, 60).replace(/\n/g, ' ') + (chunkText.length > 60 ? '...' : '');

            try {
                console.log(`      📝 [${chunkNum}/${chunks.length}] "${preview}"`);
                console.log(`         └─ 🔮 Gerando embedding...`);

                const embedding = await this.embeddingService.createEmbedding(
                    chunkText,
                    ModelType.EMBEDDING_MODEL,
                    TokenType.EMBEDDING
                );

                if (!Array.isArray(embedding) || embedding.length === 0) {
                    console.log(`         └─ ❌ Embedding inválido\n`);
                    fileErrors++;
                    continue;
                }

                console.log(`         └─ ✓ Embedding gerado (${embedding.length} dimensões)`);
                console.log(`         └─ 🔍 Verificando duplicatas...`);

                const isDuplicate = existingChunks.some((ec: any) => {
                    try { 
                        return Array.isArray(ec.embedding) && 
                               cosineSimilarity(ec.embedding, embedding) > 0.9; 
                    } catch { 
                        return false; 
                    }
                });

                if (isDuplicate) {
                    console.log(`         └─ ⏭️  Chunk duplicado (similaridade > 90%) - ignorado\n`);
                    fileDuplicates++;
                    this.stats.duplicateChunks++;
                    continue;
                }

                console.log(`         └─ 💾 Salvando no banco de dados...`);

                const chunkObject = new Chunk(
                    fileName,
                    chunkText,
                    embedding,
                );

                const created = await this.chunkRepository.create(chunkObject);

                if (created) {
                    console.log(`         └─ ✅ Salvo com sucesso (ID: ${created.id || 'N/A'})\n`);
                    existingChunks.push({ ...created, embedding });
                    fileSaved++;
                    this.stats.savedChunks++;
                } else {
                    console.log(`         └─ ❌ Falha ao salvar no banco\n`);
                    fileErrors++;
                }
            } catch (error) {
                console.log(`         └─ ❌ Erro: ${error}\n`);
                fileErrors++;
                this.stats.errors++;
            }
        }

        console.log(`\n   📈 Resumo do arquivo "${fileName}":`);
        console.log(`      ✅ Chunks salvos: ${fileSaved}`);
        console.log(`      ⏭️  Chunks duplicados: ${fileDuplicates}`);
        if (fileErrors > 0) {
            console.log(`      ❌ Erros: ${fileErrors}`);
        }
        console.log(`      📊 Total processado: ${fileSaved + fileDuplicates + fileErrors}/${chunks.length}`);

        this.stats.processedFiles++;
    }

    private printSummary(duration: string): void {
        console.log(`\n${"=".repeat(70)}`);
        console.log("🎉 PROCESSAMENTO CONCLUÍDO");
        console.log(`${"=".repeat(70)}\n`);

        console.log("📊 ESTATÍSTICAS FINAIS:\n");
        
        console.log("   📁 Arquivos:");
        console.log(`      • Total encontrado: ${this.stats.totalFiles}`);
        console.log(`      • Processados com sucesso: ${this.stats.processedFiles} ✅`);
        if (this.stats.skippedFiles > 0) {
            console.log(`      • Ignorados/Com erro: ${this.stats.skippedFiles} ⚠️`);
        }

        console.log(`\n   📦 Chunks:`);
        console.log(`      • Total gerado: ${this.stats.totalChunks}`);
        console.log(`      • Salvos na base: ${this.stats.savedChunks} ✅`);
        console.log(`      • Duplicados (ignorados): ${this.stats.duplicateChunks} ⏭️`);
        
        const skippedChunks = this.stats.totalChunks - this.stats.savedChunks - this.stats.duplicateChunks;
        if (skippedChunks > 0) {
            console.log(`      • Com erro: ${skippedChunks} ❌`);
        }

        if (this.stats.errors > 0) {
            console.log(`\n   ❌ Total de erros encontrados: ${this.stats.errors}`);
        }

        console.log(`\n   ⏱️  Tempo total: ${duration}s`);
        
        const avgTimePerFile = this.stats.processedFiles > 0 
            ? (parseFloat(duration) / this.stats.processedFiles).toFixed(2)
            : "0.00";
        console.log(`   📉 Tempo médio por arquivo: ${avgTimePerFile}s`);

        if (this.stats.savedChunks > 0) {
            const avgTimePerChunk = (parseFloat(duration) / this.stats.savedChunks).toFixed(2);
            console.log(`   📉 Tempo médio por chunk salvo: ${avgTimePerChunk}s`);
        }

        console.log(`\n${"=".repeat(70)}\n`);
    }

    private getFileIcon(ext: string): string {
        const icons: { [key: string]: string } = {
            ".PDF": "📕",
            ".DOCX": "📘",
            ".TXT": "📄"
        };
        return icons[ext] || "📄";
    }

    private splitIntoParagraphs(text: string): string[] {
        return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    }

    private splitIntoChunks(paragraphs: string[], maxTokens: number): string[] {
        const encoder = encoding_for_model(ModelType.EMBEDDING_MODEL);
        const chunks: string[] = [];
        let currentChunk = "";
        let currentTokenCount = 0;

        for (const paragraph of paragraphs) {
            const paragraphTokens = encoder.encode(paragraph);
            const paragraphTokenCount = paragraphTokens.length;

            if (paragraphTokenCount > maxTokens) {
                const words = paragraph.split(/\s+/);
                let tempChunk = "";
                let tempTokenCount = 0;

                for (const word of words) {
                    const wordTokens = encoder.encode(word);
                    if (tempTokenCount + wordTokens.length > maxTokens) {
                        if (tempChunk) chunks.push(tempChunk);
                        tempChunk = word;
                        tempTokenCount = wordTokens.length;
                    } else {
                        tempChunk += (tempChunk ? " " : "") + word;
                        tempTokenCount += wordTokens.length;
                    }
                }
                if (tempChunk) chunks.push(tempChunk);
                continue;
            }

            if (currentTokenCount + paragraphTokenCount > maxTokens) {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = paragraph;
                currentTokenCount = paragraphTokenCount;
            } else {
                currentChunk += (currentChunk ? " " : "") + paragraph;
                currentTokenCount += paragraphTokenCount;
            }
        }

        if (currentChunk) chunks.push(currentChunk);
        encoder.free();
        return chunks;
    }
}