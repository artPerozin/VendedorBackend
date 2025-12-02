import Connection from "../database/Connection";

export default class CreateMessagesTable {
    constructor(private connection: Connection) {}

    async up(): Promise<void> {
        await this.connection.execute(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
                    CREATE TYPE message_role AS ENUM ('system', 'user', 'model');
                END IF;
            END$$;

            CREATE TABLE IF NOT EXISTS public.messages (
                id UUID PRIMARY KEY,
                contact_id UUID NOT NULL,
                role message_role NOT NULL,
                content TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_messages_contact
                    FOREIGN KEY (contact_id)
                    REFERENCES public.contacts (id)
                    ON DELETE CASCADE
            );
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
