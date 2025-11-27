import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import GetMessagesFromConversationOutput from "./GetMessagesFromConversationOutput";
import GetMessagesFromConversationInput from "./GetMessagesFromConversationInput";

export default class GetMessagesFromConversation {

    readonly conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async execute(input: GetMessagesFromConversationInput): Promise<GetMessagesFromConversationOutput> {
        const response = await this.conversationRepository.getMessages(input.chatId);
        return { data: response };
    }
}