import { v4 as uuid } from "uuid";

export type MessageRole = "system" | "user" | "model";

export default class Message {
    readonly contactId: string;
    readonly role: MessageRole;
    readonly content: string;
    readonly orderIndex: number;
    readonly id: string;

    constructor(
        params: {
            contactId: string;
            role: MessageRole;
            content: string;
            orderIndex: number;
            id?: string;
        }
    ) {
        this.contactId = params.contactId;
        this.role = params.role;
        this.content = params.content;
        this.orderIndex = params.orderIndex ?? 0;
        this.id = params.id || uuid();
    }
}
