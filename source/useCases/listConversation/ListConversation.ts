import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import ListConversationOutput from "./ListConversationOutput";
import ListConversationInput from "./ListConversationInput";

export default class ListConversation {

    readonly conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async execute(input: ListConversationInput): Promise<ListConversationOutput> {
        const response = await this.conversationRepository.getAllByUserId(input.userId);
        return { data: response};
    }

}