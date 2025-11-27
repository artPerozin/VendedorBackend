import Connection from "../database/Connection";

export default class CreateChunksTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.chunks (
                id UUID PRIMARY KEY,
                file_name TEXT NOT NULL,
                chunk TEXT NOT NULL,
                embedding JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`DROP TABLE IF EXISTS public.chunks;`);
    }
}
