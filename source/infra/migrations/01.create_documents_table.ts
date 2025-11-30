import Connection from "../database/Connection";

export default class CreateDocumentsTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.documents (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                source VARCHAR(255),
                category VARCHAR(100),
                section VARCHAR(100),
                subsection VARCHAR(100),
                page_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_documents_category 
                ON public.documents(category);
            
            CREATE INDEX IF NOT EXISTS idx_documents_section 
                ON public.documents(section);
            
            CREATE INDEX IF NOT EXISTS idx_documents_created_at 
                ON public.documents(created_at);
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`
            DROP INDEX IF EXISTS public.idx_documents_created_at;
            DROP INDEX IF EXISTS public.idx_documents_section;
            DROP INDEX IF EXISTS public.idx_documents_category;
            DROP TABLE IF EXISTS public.documents;
        `);
    }
}