import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import DeleteConversationInput from "./DeleteConversationInput";

export default class DeleteConversation {

    readonly conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async execute(input: DeleteConversationInput): Promise<void> {
        await this.conversationRepository.deleteConversation(input.chatId, input.userId);
    }
}