import Chunk from "../Entity/Chunk";

export default interface ChunkRepositoryInterface {
    create(token: Chunk): Promise<Chunk | null>;
    getAll(): Promise<Chunk[]>;
}