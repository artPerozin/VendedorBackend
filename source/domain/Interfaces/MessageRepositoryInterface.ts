import { Content } from "@google/genai";
import Message from "../Entity/Message";

export default interface MessageRepositoryInterface {
    addMessage(message: Message): Promise<void>;
    retrieveHistory(contactId: string): Promise<Content[]>;
    getLastMessage(contactId: string): Promise<Message | null>;
}
