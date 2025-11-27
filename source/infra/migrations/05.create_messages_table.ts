import Connection from "../database/Connection";

export default class CreateMessagesTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
                    CREATE TYPE message_role AS ENUM ('system', 'user', 'assistant');
                END IF;
            END$$;

            CREATE TABLE IF NOT EXISTS public.messages (
                id UUID PRIMARY KEY,
                conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
                role message_role NOT NULL,
                content TEXT NOT NULL,
                context_ids text[] DEFAULT '{}',
                metadata JSONB DEFAULT '{}'::jsonb,
                order_index INT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_messages_conversation_order
                ON public.messages(conversation_id, order_index);
        `);
    }

    async down(): Promise<void> {
        await this.connection.execute(`
            DROP TABLE IF EXISTS public.messages;

            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
                    DROP TYPE message_role;
                END IF;
            END$$;
        `);
    }
}
