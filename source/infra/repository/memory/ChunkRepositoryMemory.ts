import SearchEmbeddingDTO from "../../../domain/DTO/SearchEmbeddingDTO";
import Chunk from "../../../domain/Entity/Chunk";
import ChunkRepositoryInterface from "../../../domain/Interfaces/ChunkRepositoryInterface";

export class ChunkRepositoryMemory implements ChunkRepositoryInterface {
    private chunks: Chunk[] = [];

    async create(chunk: Chunk): Promise<void> {
        const exists = this.chunks.find(c => c.id === chunk.id);
        if (!exists) {
            this.chunks.push(chunk);
        }
    }

    async createMany(chunks: Chunk[]): Promise<void> {
        for (const chunk of chunks) {
            await this.create(chunk);
        }
    }

    async searchByEmbedding(dto: SearchEmbeddingDTO): Promise<Array<{ content: string; similarity: number }>> {
        const { embedding, limit, similarityThreshold } = dto;

        const results = this.chunks.map(chunk => {
            const similarity = this.cosineSimilarity(embedding, chunk.embedding);
            return {
                content: chunk.content,
                similarity,
            };
        });

        return results
            .filter(r => r.similarity >= similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude === 0 ? 0 : dotProduct / magnitude;
    }

    clear(): void {
        this.chunks = [];
    }

    getAll(): Chunk[] {
        return [...this.chunks];
    }
}
