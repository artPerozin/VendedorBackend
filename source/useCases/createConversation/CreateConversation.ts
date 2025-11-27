import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import CreateConversationInput from "./CreateConversationInput";
import Conversation from "../../domain/Entity/Conversation";
import CreateConversationOutput from "./CreateConversationOutput";

export default class CreateConversation {

    readonly conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async execute(input: CreateConversationInput): Promise<CreateConversationOutput> {
        const conversation = new Conversation(input.userId, input.title);
        await this.conversationRepository.create(conversation);
        return { conversation }
    }
}