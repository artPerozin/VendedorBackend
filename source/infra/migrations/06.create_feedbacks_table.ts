import Connection from "../database/Connection";

export default class CreateFeedbacksTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS public.feedbacks (
                id UUID PRIMARY KEY,
                message_id UUID NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`DROP TABLE IF EXISTS public.feedbacks;`);
    }
}
