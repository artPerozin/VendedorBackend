import Connection from "../database/Connection";

export default class CreateConversationsTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.conversations (
                id UUID PRIMARY KEY,
                userId UUID NOT NULL,
                title TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`DROP TABLE IF EXISTS public.conversations;`);
    }
}
