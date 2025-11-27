import Connection from "../database/Connection";

export default class CreateUsersTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`DROP TABLE IF EXISTS public.users;`);
    }
}
