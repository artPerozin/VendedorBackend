import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import CreateFeedback from "../../useCases/createFeedback/CreateFeedback";
import CreateFeedbackInput from "../../useCases/createFeedback/CreateFeedbackInput";
import CreateFeedbackOutput from "../../useCases/createFeedback/CreateFeedbackOutput";

export default class FeedbackController {

    constructor(protected repositoryFactory: RepositoryFactoryInterface) {
    }

    async createFeedback(input: CreateFeedbackInput): Promise<CreateFeedbackOutput> {
        const createFeedback = new CreateFeedback(this.repositoryFactory);
        return await createFeedback.execute(input);
    }

}