import Conversation from "../../../domain/Entity/Conversation";
import Message from "../../../domain/Entity/Message";
import ConversationRepositoryInterface from "../../../domain/Interfaces/ConversationRepositoryInterface";
import Connection from "../../database/Connection";

export default class ConversationRepositoryDatabase implements ConversationRepositoryInterface {
    constructor(protected connection: Connection) {}

    async create(conversation: Conversation): Promise<Conversation | null> {
        await this.connection.execute(
            "INSERT INTO conversations (id, userid, title, created_at, updated_at) VALUES ($1, $2, $3, $4, $5);",
            [conversation.id, conversation.userId, conversation.title, new Date(), new Date()]
        );
        return await this.findById(conversation.id)
    }

    async getAllByUserId(userId: string): Promise<Conversation[]> {
        const rows = await this.connection.execute(
            "SELECT id, title FROM conversations WHERE userid = $1;", [userId]
        );
        return rows.map((r: any) => new Conversation(r.userId, r.title, r.id));
    }

    async updateConversationTitle(conversation_id: string, title: string): Promise<void> {
        await this.connection.execute(
            "UPDATE conversations SET title = $1 where id = $2", [title, conversation_id]
        );
    }

    async findById(id: string): Promise<Conversation | null> {
        const rows = await this.connection.execute(
            "SELECT * FROM conversations WHERE id = $1;", [id]
        );
        if (!rows.length) return null;
        const r = rows[0];
        return new Conversation(r.userId, r.title, r.id);
    }

    async addMessage(conversationId: string, message: Message): Promise<void> {
        await this.connection.execute(
            `
            INSERT INTO messages 
                (id, conversation_id, role, content, context_ids, metadata, order_index, created_at)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8);
            `,
            [
                message.id,
                conversationId,
                message.role,
                message.content,
                message.contextIds,
                message.metadata ?? {},
                message.orderIndex,
                message.createdAt,
            ]
        );
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const rows = await this.connection.execute(
            `
            SELECT 
                id,
                conversation_id,
                role,
                content,
                context_ids,
                metadata,
                order_index,
                created_at
            FROM messages 
            WHERE conversation_id = $1 
            ORDER BY order_index ASC;
            `,
            [conversationId]
        );

        return rows.map((r: any) => new Message({
            id: r.id,
            chatId: r.conversation_id,
            role: r.role,
            content: r.content,
            contextIds: r.context_ids ?? [],
            metadata: r.metadata ?? {},
            orderIndex: r.order_index,
            createdAt: r.created_at,
        }));
    }

    async deleteConversation(chatId: string, userId: string): Promise<void> {
        await this.connection.execute("DELETE FROM conversations WHERE id = $1 and userid = $2;", [chatId, userId]);
    }
}
