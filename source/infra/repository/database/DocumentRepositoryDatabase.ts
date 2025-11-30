import Document from "../../../domain/Entity/Document";
import DocumentRepositoryInterface from "../../../domain/Interfaces/DocumentRepositoryInterface";
import Connection from "../../database/Connection";

export default class DocumentRepositoryDatabase implements DocumentRepositoryInterface {
    constructor(protected connection: Connection) {}

    async create(document: Document): Promise<void> {
        await this.connection.execute(
            `INSERT INTO public.documents 
            (id, title, content, source, category, section, subsection, page_count, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING`,
            [
                document.id,
                document.title,
                document.content,
                document.source,
                document.category,
                document.section,
                document.subsection,
                document.pageCount,
                document.createdAt,
                document.updatedAt,
            ]
        );
    }

    async createMany(documents: Document[]): Promise<void> {
        if (documents.length === 0) return;

        const values = documents
            .map(
                (doc, index) =>
                    `($${index * 10 + 1}, $${index * 10 + 2}, $${index * 10 + 3}, $${index * 10 + 4}, $${
                        index * 10 + 5
                    }, $${index * 10 + 6}, $${index * 10 + 7}, $${index * 10 + 8}, $${index * 10 + 9}, $${
                        index * 10 + 10
                    })`
            )
            .join(", ");

        const params = documents.flatMap((doc) => [
            doc.id,
            doc.title,
            doc.content,
            doc.source,
            doc.category,
            doc.section,
            doc.subsection,
            doc.pageCount,
            doc.createdAt,
            doc.updatedAt,
        ]);

        await this.connection.execute(
            `INSERT INTO public.documents 
            (id, title, content, source, category, section, subsection, page_count, created_at, updated_at)
            VALUES ${values}
            ON CONFLICT (id) DO NOTHING`,
            params
        );
    }
}