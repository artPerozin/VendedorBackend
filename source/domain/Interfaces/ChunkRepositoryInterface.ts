import SearchEmbeddingDTO from "../DTO/SearchEmbeddingDTO";
import Chunk from "../Entity/Chunk";

export default interface ChunkRepositoryInterface {
    create(chunk: Chunk): Promise<void>;
    createMany(chunks: Chunk[]): Promise<void>
    searchByEmbedding(dto: SearchEmbeddingDTO): Promise<Array<{
        content: string;
        similarity: number;
    }>>;
}