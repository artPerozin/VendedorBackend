import { Content } from "@google/genai";
import Message from "../../../domain/Entity/Message";
import MessageRepositoryInterface from "../../../domain/Interfaces/MessageRepositoryInterface";

export class MessageRepositoryMemory implements MessageRepositoryInterface {
    private messages: Message[] = [];

    async addMessage(message: Message): Promise<void> {
        this.messages.push(message);
    }

    async retrieveHistory(contactId: string): Promise<Content[]> {
        const contactMessages = this.messages
            .filter(m => m.contactId === contactId)
            .sort((a, b) => a.orderIndex - b.orderIndex);

        return contactMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));
    }

    async getLastMessage(phoneNumber: string): Promise<Message | null> {
        const contactMessages = this.messages
            .filter(m => m.contactId === phoneNumber)
            .sort((a, b) => b.orderIndex - a.orderIndex);

        return contactMessages.length > 0 ? contactMessages[0] : null;
    }

    clear(): void {
        this.messages = [];
    }

    getAll(): Message[] {
        return [...this.messages];
    }

    getByContactId(contactId: string): Message[] {
        return this.messages
            .filter(m => m.contactId === contactId)
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }
}