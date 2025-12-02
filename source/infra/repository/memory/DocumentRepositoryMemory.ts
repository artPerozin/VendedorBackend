import Document from "../../../domain/Entity/Document";
import DocumentRepositoryInterface from "../../../domain/Interfaces/DocumentRepositoryInterface";

export class DocumentRepositoryMemory implements DocumentRepositoryInterface {
    private documents: Document[] = [];

    async create(document: Document): Promise<void> {
        const exists = this.documents.find(d => d.id === document.id);
        if (!exists) {
            this.documents.push(document);
        }
    }

    async createMany(documents: Document[]): Promise<void> {
        for (const document of documents) {
            await this.create(document);
        }
    }

    clear(): void {
        this.documents = [];
    }

    getAll(): Document[] {
        return [...this.documents];
    }
}