import dotenv from "dotenv";
import DatabaseRepositoryFactory from "../infra/repository/DatabaseRepositoryFactory";
import PostgreSQLConnection from "../infra/database/PostgreSQLConnection";
import { DocumentProcessor } from "../domain/Services/RAG/DocumentProcessor";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function main() {    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const BOK_PATH = process.env.BOK_PATH || "./BOK";
    const ENABLE_SUMMARIZATION = process.env.ENABLE_SUMMARIZATION !== "false";
    const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || "0.95");
    const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "100");
    const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL;
    const GEMINI_MODEL = process.env.GEMINI_MODEL;

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY não encontrada no .env");
    }

    try {
        console.log("🚀 Iniciando treinamento da IA (modo otimizado)...\n");

        const connection = new PostgreSQLConnection({
            user: process.env.DB_USERNAME ?? "",
            password: process.env.DB_PASSWORD ?? "",
            database: process.env.DB_DATABASE ?? "",
            host: process.env.DB_HOST ?? "",
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        });

        const repositoryFactory = new DatabaseRepositoryFactory(connection);
        const documentRepository = repositoryFactory.createDocumentRepository();
        const chunkRepository = repositoryFactory.createChunkRepository();

        const genAI = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });

        const processor = new DocumentProcessor(
            genAI,
            {
                chunkSize: 400,
                chunkOverlap: 50,
                embeddingModel: GEMINI_EMBEDDING_MODEL,
                generationModel: GEMINI_MODEL,
                summarize: ENABLE_SUMMARIZATION,
                similarityThreshold: SIMILARITY_THRESHOLD,
                batchSize: BATCH_SIZE,
            }
        );

        const results = await processor.processDirectory(BOK_PATH);

        console.log("\n💾 Salvando no banco de dados (modo batch)...\n");

        const allDocuments = results.map((r) => r.document);
        const allChunks = results.flatMap((r) => r.chunks);

        console.log(`   🔄 Inserindo ${allDocuments.length} documentos...`);
        await documentRepository.createMany(allDocuments);
        console.log(`   ✅ ${allDocuments.length} documentos salvos`);

        console.log(`   🔄 Inserindo ${allChunks.length} chunks...`);
        await chunkRepository.createMany(allChunks);
        console.log(`   ✅ ${allChunks.length} chunks salvos`);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 Treinamento concluído com sucesso!");
        console.log("=".repeat(60));
        console.log(`📊 Estatísticas:`);
        console.log(`   • Documentos processados: ${allDocuments.length}`);
        console.log(`   • Chunks únicos gerados: ${allChunks.length}`);
        console.log(`   • Média: ${(allChunks.length / allDocuments.length).toFixed(1)} chunks/doc`);
        console.log(`   • Sumarização: ${ENABLE_SUMMARIZATION ? "✅ Ativada" : "❌ Desativada"}`);
        console.log(`   • Limiar de similaridade: ${(SIMILARITY_THRESHOLD * 100).toFixed(0)}%`);
        console.log(`   • Tamanho do lote: ${BATCH_SIZE} embeddings/request`);
        console.log("=".repeat(60) + "\n");

        console.log("📋 Detalhes por documento:\n");
        results.forEach((result, index) => {
            const { document, chunks } = result;
            console.log(`   ${index + 1}. ${document.title}`);
            console.log(`      • Categoria: ${document.category || "N/A"}`);
            console.log(`      • Seção: ${document.section || "N/A"}`);
            console.log(`      • Chunks: ${chunks.length}`);
            console.log(`      • Tamanho original: ${document.content.length} caracteres`);
            console.log();
        });

    } catch (error) {
        console.error("\n❌ Erro fatal durante o treinamento:", error);
        
        if (error instanceof Error) {
            console.error("Mensagem:", error.message);
            console.error("Stack:", error.stack);
        }
        
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Erro não tratado:", error);
    process.exit(1);
});
