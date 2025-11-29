import { v4 as uuid } from "uuid";
import Chunk from "./Chunk";

export default class Document {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly source?: string;
    readonly category?: string;
    readonly section?: string;
    readonly subsection?: string;
    readonly pageCount?: number;
    readonly chunks?: Chunk[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(params: {
        id?: string;
        title: string;
        content: string;
        source?: string;
        category?: string;
        section?: string;
        subsection?: string;
        pageCount?: number;
        chunks?: Chunk[];
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = params.id || uuid();
        this.title = params.title;
        this.content = params.content;
        this.source = params.source;
        this.category = params.category;
        this.section = params.section;
        this.subsection = params.subsection;
        this.pageCount = params.pageCount;
        this.chunks = params.chunks;
        this.createdAt = params.createdAt || new Date();
        this.updatedAt = params.updatedAt || new Date();
    }

    static create(params: {
        title: string;
        content: string;
        source?: string;
        category?: string;
        section?: string;
        subsection?: string;
        pageCount?: number;
    }): Document {
        return new Document({
            ...params,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    addChunks(chunks: Chunk[]): Document {
        return new Document({
            ...this,
            chunks: [...(this.chunks || []), ...chunks],
            updatedAt: new Date(),
        });
    }
}