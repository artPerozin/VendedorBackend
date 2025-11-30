import Connection from "../database/Connection";

export default class CreateChunksTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE EXTENSION IF NOT EXISTS vector;

            CREATE TABLE IF NOT EXISTS public.chunks (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                embedding vector(768) NOT NULL,
                document_id UUID NOT NULL,
                chunk_index INTEGER NOT NULL,
                start_position INTEGER,
                end_position INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_chunks_document
                    FOREIGN KEY (document_id)
                    REFERENCES public.documents (id)
                    ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chunks_document_id 
                ON public.chunks(document_id);
            
            CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index 
                ON public.chunks(chunk_index);
            
            CREATE INDEX IF NOT EXISTS idx_chunks_created_at 
                ON public.chunks(created_at);
            
            -- Índice para busca vetorial eficiente (HNSW)
            CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
                ON public.chunks 
                USING hnsw (embedding vector_cosine_ops);
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`
            DROP INDEX IF EXISTS public.idx_chunks_embedding;
            DROP INDEX IF EXISTS public.idx_chunks_created_at;
            DROP INDEX IF EXISTS public.idx_chunks_chunk_index;
            DROP INDEX IF EXISTS public.idx_chunks_document_id;
            DROP TABLE IF EXISTS public.chunks;
        `);
    }
}