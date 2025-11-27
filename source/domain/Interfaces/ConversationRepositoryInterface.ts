import Conversation from "../Entity/Conversation";
import Message from "../Entity/Message";

export default interface ConversationRepositoryInterface {
    create(chat: Conversation): Promise<Conversation | null>;
    getAllByUserId(userId: string): Promise<Conversation[]>;
    findById(id: string): Promise<Conversation | null>;
    updateConversationTitle(chatId: string, title: string): Promise<void>;
    deleteConversation(chatId: string, userId: string): Promise<void>
    
    addMessage(chatId: string, message: Message): Promise<void>;
    getMessages(chatId: string): Promise<Message[]>;
}
