import { v4 as uuid } from "uuid";

export type MessageRole = "system" | "user" | "assistant";

export default class Message {
    readonly id: string;
    readonly chatId: string;
    readonly role: MessageRole;
    readonly content: string;
    readonly createdAt: Date;
    readonly contextIds: string[];
    readonly orderIndex: number;

    constructor(
        params: {
            chatId: string;
            role: MessageRole;
            content: string;
            contextIds?: string[];
            orderIndex?: number;
            id?: string;
            createdAt?: Date;
        }
    ) {
        this.id = params.id || uuid();
        this.chatId = params.chatId;
        this.role = params.role;
        this.content = params.content;
        this.createdAt = params.createdAt || new Date();
        this.contextIds = params.contextIds || [];
        this.orderIndex = params.orderIndex ?? 0;
    }
}
