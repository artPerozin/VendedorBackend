import { v4 as uuid } from "uuid";
import Document from "./Document";

export default class Chunk {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly embedding: number[];
    readonly documentId: string;
    readonly document?: Document;
    readonly chunkIndex: number;
    readonly startPosition?: number;
    readonly endPosition?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(params: {
        id?: string;
        title: string;
        content: string;
        embedding: number[];
        documentId: string;
        document?: Document;
        chunkIndex: number;
        startPosition?: number;
        endPosition?: number;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = params.id || uuid();
        this.title = params.title;
        this.content = params.content;
        this.embedding = params.embedding;
        this.documentId = params.documentId;
        this.document = params.document;
        this.chunkIndex = params.chunkIndex;
        this.startPosition = params.startPosition;
        this.endPosition = params.endPosition;
        this.createdAt = params.createdAt || new Date();
        this.updatedAt = params.updatedAt || new Date();
    }

    static create(params: {
        title: string;
        content: string;
        embedding: number[];
        documentId: string;
        chunkIndex: number;
        startPosition?: number;
        endPosition?: number;
    }): Chunk {
        return new Chunk({
            ...params,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    updateEmbedding(embedding: number[]): Chunk {
        return new Chunk({
            ...this,
            embedding,
            updatedAt: new Date(),
        });
    }
}