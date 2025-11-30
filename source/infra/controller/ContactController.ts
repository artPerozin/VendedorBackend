import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import AskQuestionInput from "../../useCases/askQuestion/AskQuestionInput";
import AskQuestion from "../../useCases/askQuestion/AskQuestion";
import AskQuestionOutput from "../../useCases/askQuestion/AskQuestionOutput";

export default class ContactController {

    constructor(protected repositoryFactory: RepositoryFactoryInterface) {}

    async askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
        const askQuestion = new AskQuestion(this.repositoryFactory);
        return await askQuestion.execute(input);
    }
}