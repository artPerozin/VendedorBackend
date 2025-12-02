import { Content } from "@google/genai";
import Message from "../../../domain/Entity/Message";
import MessageRepositoryInterface from "../../../domain/Interfaces/MessageRepositoryInterface";
import Connection from "../../database/Connection";

export default class MessageRepositoryDatabase implements MessageRepositoryInterface {
    constructor(protected connection: Connection) {}

    async addMessage(message: Message): Promise<void> {
        await this.connection.execute(
            `INSERT INTO messages
                (id, contact_id, role, content, order_index)
            VALUES
                ($1, $2, $3, $4, $5);`,
            [
                message.id,
                message.contactId,
                message.role,
                message.content,
                message.orderIndex,
            ]
        );
    }

    async retrieveHistory(contactId: string): Promise<Content[]> {
        const rows = await this.connection.execute(
            `SELECT
                m.role,
                m.content
            FROM messages m
            WHERE contact_id = $1
            ORDER BY order_index ASC;`,
            [contactId]
        );

        return rows.map((r: any): Content => ({
            role: r.role,
            parts: [
                { text: r.content }
            ],
        }));
    }

    async getLastMessage(phoneNumber: string): Promise<Message | null> {
        const rows = await this.connection.execute(
            `SELECT
                *
            FROM messages m
            JOIN contacts c on c.id = m.contact_id
            WHERE c.phone_number = $1
            ORDER BY m.order_index DESC
            LIMIT 1;`,
            [phoneNumber]
        )
        if (!rows.length) return null;
        return this.mapRowToMessage(rows[0]);
    }

    private mapRowToMessage(r: any): Message {
        const messageInput = {
            id: r.id,
            contactId: r.contactId,
            role: r.role,
            content: r.content,
            contextIds: r.contextIds,
            orderIndex: r.orderIndex,
        };
    
        return new Message(messageInput)
    }
}
