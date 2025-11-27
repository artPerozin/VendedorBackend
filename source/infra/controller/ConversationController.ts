import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import CreateConversationInput from "../../useCases/createConversation/CreateConversationInput";
import CreateConversation from "../../useCases/createConversation/CreateConversation";
import ListConversation from "../../useCases/listConversation/ListConversation";
import ListConversationOutput from "../../useCases/listConversation/ListConversationOutput";
import UpdateConversationInput from "../../useCases/updateConversation/UpdateConversationInput";
import UpdateConversation from "../../useCases/updateConversation/UpdateConversation";
import AskQuestionInput from "../../useCases/askQuestion/AskQuestionInput";
import AskQuestion from "../../useCases/askQuestion/AskQuestion";
import AskQuestionOutput from "../../useCases/askQuestion/AskQuestionOutput";
import ListConversationInput from "../../useCases/listConversation/ListConversationInput";
import DeleteConversationInput from "../../useCases/deleteConversation/DeleteConversationInput";
import DeleteConversation from "../../useCases/deleteConversation/DeleteConversation";
import GetMessagesFromConversationInput from "../../useCases/getMessagesFromConversation/GetMessagesFromConversationInput";
import GetMessagesFromConversationOutput from "../../useCases/getMessagesFromConversation/GetMessagesFromConversationOutput";
import GetMessagesFromConversation from "../../useCases/getMessagesFromConversation/GetMessagesFromConversation";
import CreateConversationOutput from "../../useCases/createConversation/CreateConversationOutput";

export default class ConversationController {

    constructor(protected repositoryFactory: RepositoryFactoryInterface) {
    }

    async createConversation(input: CreateConversationInput): Promise<CreateConversationOutput> {
        const createConversation = new CreateConversation(this.repositoryFactory);
        return await createConversation.execute(input);
    }

    async listConversations(input: ListConversationInput): Promise<ListConversationOutput> {
        const listConversation = new ListConversation(this.repositoryFactory);
        return await listConversation.execute(input);
    }

    async updateConversation(input: UpdateConversationInput): Promise<void> {
        const updateConversation = new UpdateConversation(this.repositoryFactory);
        return await updateConversation.execute(input);
    }

    async askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
        const askQuestion = new AskQuestion(this.repositoryFactory);
        return await askQuestion.execute(input);
    }

    async deleteConversation(input: DeleteConversationInput): Promise<void> {
        const deleteConversation = new DeleteConversation(this.repositoryFactory);
        await deleteConversation.execute(input);
    }

    async getMessagesFromConversation(input: GetMessagesFromConversationInput): Promise<GetMessagesFromConversationOutput> {
        const getMessagesFromConversation = new GetMessagesFromConversation(this.repositoryFactory);
        return await getMessagesFromConversation.execute(input);
    }
}