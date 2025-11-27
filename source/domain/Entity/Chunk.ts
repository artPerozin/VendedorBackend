import { v4 as uuid } from "uuid";

export default class Chunk {
    readonly id: string;
    readonly fileName: string;
    readonly chunk: string;
    readonly embedding: string | number[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(
        fileName: string,
        chunk: string,
        embedding: string | number[],
        id?: string
    ) {
        if (!id) id = uuid();
        this.id = id;
        this.fileName = fileName;
        this.chunk = chunk;
        this.embedding = embedding;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}
