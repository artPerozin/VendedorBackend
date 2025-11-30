import { GoogleGenAI } from "@google/genai";
import { Validators } from "../../../shared/validator/Validators";

const EMBEDDING_MODEL = 'text-embedding-004'; 
const EMBEDDING_DIMENSION = 768;

export default class EmbeddingService {
    private ai: GoogleGenAI;
    private modelName: string;

    constructor() {
        this.ai = new GoogleGenAI({});
        this.modelName = process.env.EMBEDDING_MODEL ?? EMBEDDING_MODEL; 
    }

    async handle(text: string): Promise<number[]> {
        Validators.required(text, "text");

        try {
            const response = await this.ai.models.embedContent({
                model: this.modelName,
                contents: [text],
            });

            const embedding = response.embeddings?.[0]?.values;

            if (!embedding) throw new Error("A resposta do serviço de embedding não contém valores.");
            if (embedding.length !== EMBEDDING_DIMENSION) {
                console.warn(`Dimensão do embedding inesperada: ${embedding.length}. Esperado: ${EMBEDDING_DIMENSION}`);
            }

            return embedding;

        } catch (error) {
            console.error("Erro ao gerar embedding:", error);
            throw new Error("Falha ao se comunicar com o serviço de embedding do Gemini.");
        }
    }
}