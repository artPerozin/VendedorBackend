import Conversation from "../../../domain/Entity/Conversation";
import Message from "../../../domain/Entity/Message";
import ConversationRepositoryInterface from "../../../domain/Interfaces/ConversationRepositoryInterface";

export default class ConversationRepositoryMemory implements ConversationRepositoryInterface {
    public conversations: Map<string, Conversation>;
    public messages: Map<string, Message[]>;

    constructor() {
        this.conversations = new Map<string, Conversation>();
        this.messages = new Map<string, Message[]>();
    }

    async create(conversation: Conversation): Promise<Conversation | null> {
        this.conversations.set(conversation.id, conversation);
        if (!this.messages.has(conversation.id)) {
            this.messages.set(conversation.id, []);
        }
        return this.findById(conversation.id);
    }

    async getAllByUserId(userId: string): Promise<Conversation[]> {
        const rows: Conversation[] = [];
        for (const conv of this.conversations.values()) {
            if (conv.userId === userId) {
                rows.push(conv);
            }
        }
        return rows;
    }

    async updateConversationTitle(conversation_id: string, title: string): Promise<void> {
        const conv = this.conversations.get(conversation_id);
        if (!conv) return;
        conv.setTitle(title);
        this.conversations.set(conversation_id, conv);
    }

    async findById(id: string): Promise<Conversation | null> {
        const conv = this.conversations.get(id) || null;
        return conv;
    }

    async addMessage(conversationId: string, message: Message): Promise<void> {
        if (!this.messages.has(conversationId)) {
            this.messages.set(conversationId, []);
        }

        const list = this.messages.get(conversationId)!;

        list.push(message);
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const list = this.messages.get(conversationId);
        if (!list) return [];
        return [...list].sort((a, b) => a.orderIndex - b.orderIndex);
    }

    async deleteConversation(chatId: string, userId: string): Promise<void> {
        const conv = this.conversations.get(chatId);
        if (!conv) return;
        if (conv.userId === userId) {
            this.conversations.delete(chatId);
            this.messages.delete(chatId);
        }
    }
}
