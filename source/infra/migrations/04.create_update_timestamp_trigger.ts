import Connection from "../database/Connection";

export default class CreateUpdateTimestampTrigger {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON public.documents;
            CREATE TRIGGER trigger_update_documents_updated_at
                BEFORE UPDATE ON public.documents
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS trigger_update_chunks_updated_at ON public.chunks;
            CREATE TRIGGER trigger_update_chunks_updated_at
                BEFORE UPDATE ON public.chunks
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`
            DROP TRIGGER IF EXISTS trigger_update_chunks_updated_at ON public.chunks;
            DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON public.documents;
            DROP FUNCTION IF EXISTS update_updated_at_column();
        `);
    }
}