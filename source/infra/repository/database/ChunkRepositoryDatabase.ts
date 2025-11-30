import SearchEmbeddingDTO from "../../../domain/DTO/SearchEmbeddingDTO";
import Chunk from "../../../domain/Entity/Chunk";
import ChunkRepositoryInterface from "../../../domain/Interfaces/ChunkRepositoryInterface";
import Connection from "../../database/Connection";

export default class ChunkRepositoryDatabase implements ChunkRepositoryInterface {
    constructor(protected connection: Connection) {}

    async create(chunk: Chunk): Promise<void> {
        await this.connection.execute(
            `INSERT INTO public.chunks 
            (id, title, content, embedding, document_id, chunk_index, start_position, end_position, created_at, updated_at)
            VALUES ($1, $2, $3, $4::vector, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING`,
            [
                chunk.id,
                chunk.title,
                chunk.content,
                `[${chunk.embedding.join(",")}]`,
                chunk.documentId,
                chunk.chunkIndex,
                chunk.startPosition,
                chunk.endPosition,
                chunk.createdAt,
                chunk.updatedAt,
            ]
        );
    }

    async createMany(chunks: Chunk[]): Promise<void> {
        if (chunks.length === 0) return;

        const batchSize = 100;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            await this.insertBatch(batch);
        }
    }

    private async insertBatch(chunks: Chunk[]): Promise<void> {
        const values = chunks
            .map(
                (_, index) =>
                    `($${index * 10 + 1}, $${index * 10 + 2}, $${index * 10 + 3}, $${index * 10 + 4}::vector, $${
                        index * 10 + 5
                    }, $${index * 10 + 6}, $${index * 10 + 7}, $${index * 10 + 8}, $${index * 10 + 9}, $${
                        index * 10 + 10
                    })`
            )
            .join(", ");

        const params = chunks.flatMap((chunk) => [
            chunk.id,
            chunk.title,
            chunk.content,
            `[${chunk.embedding.join(",")}]`,
            chunk.documentId,
            chunk.chunkIndex,
            chunk.startPosition,
            chunk.endPosition,
            chunk.createdAt,
            chunk.updatedAt,
        ]);

        await this.connection.execute(
            `INSERT INTO public.chunks 
            (id, title, content, embedding, document_id, chunk_index, start_position, end_position, created_at, updated_at)
            VALUES ${values}
            ON CONFLICT (id) DO NOTHING`,
            params
        );
    }

    async searchByEmbedding(dto: SearchEmbeddingDTO): Promise<Array<{ content: string; similarity: number }>> {
        const { embedding, limit, similarityThreshold } = dto;
        const vectorString = `[${embedding.join(",")}]`;
        const sql = `
            SELECT 
                content,
                1 - (embedding <=> $1) AS similarity_score
            FROM 
                chunks
            WHERE 
                (1 - (embedding <=> $1)) >= $3
            ORDER BY 
                similarity_score DESC
            LIMIT 
                $2;
        `;
        
        const rows = await this.connection.execute(sql, [
            vectorString,
            limit,
            similarityThreshold,
        ]);

        return rows.map((r: any) => ({
            content: r.content,
            similarity: Number(r.similarity_score),
        }));
    }


}