import Chunk from "../../../domain/Entity/Chunk";
import ChunkRepositoryInterface from "../../../domain/Interfaces/ChunkRepositoryInterface";
import Connection from "../../database/Connection";

export default class ChunkRepositoryDatabase implements ChunkRepositoryInterface {

    constructor(protected connection: Connection) {
    }

    async create(chunk: Chunk): Promise<Chunk | null> {
        await this.connection.execute("insert into chunks (id, file_name, chunk, embedding, created_at, updated_at) values ($1, $2, $3, $4, $5, $6);", [chunk.id, chunk.fileName, chunk.chunk, JSON.stringify(chunk.embedding), chunk.createdAt, chunk.updatedAt]);
        return chunk;
    }

    async getAll(): Promise<Chunk[]> {
        return await this.connection.execute("select * from chunks order by created_at")
    }
}