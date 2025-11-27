import Connection from "../database/Connection";

export default class CreateTokensTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.tokens (
                id UUID PRIMARY KEY,
                model TEXT NOT NULL,
                type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`DROP TABLE IF EXISTS public.tokens;`);
    }
}
