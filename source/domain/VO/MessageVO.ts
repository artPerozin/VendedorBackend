import { v4 as uuid } from "uuid";

export type MessageRole = "system" | "user" | "assistant";

export default class MessageVO {
    readonly id: string;
    readonly chatId: string;
    readonly role: MessageRole;
    readonly content: string;
    readonly createdAt: Date;
    readonly contextIds: string[];
    readonly orderIndex: number;
    readonly metadata?: Record<string, any>;

    constructor(
        chatId: string,
        role: MessageRole,
        content: string,
        contextIds?: string[],
        orderIndex?: number,
        metadata?: Record<string, any>,
        id?: string,
        createdAt?: Date,
    ) {
        this.id = id || uuid();
        this.chatId = chatId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt || new Date();
        this.contextIds = contextIds || [];
        this.orderIndex = orderIndex ?? 0;
        this.metadata = metadata;
    }
}
