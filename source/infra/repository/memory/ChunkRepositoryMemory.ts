import Chunk from "../../../domain/Entity/Chunk";
import ChunkRepositoryInterface from "../../../domain/Interfaces/ChunkRepositoryInterface";

export default class ChunkRepositoryMemory implements ChunkRepositoryInterface {

    private chunks: Chunk[];

    constructor() {
        this.chunks = [];
    }
    
    async create(chunk: Chunk): Promise<Chunk | null> {
        this.chunks.push(chunk);
        return chunk;
    }

    async getAll(): Promise<Chunk[]> {
        return this.chunks;
    }
}