import Feedback from "../../domain/Entity/Feedback";
import FeedbackRepositoryInterface from "../../domain/Interfaces/FeedbackRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import { AppError } from "../../shared/error/AppError";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { Validators } from "../../shared/validator/Validators";
import CreateFeedbackInput from "./CreateFeedbackInput";
import CreateFeedbackOutput from "./CreateFeedbackOutput";

export default class CreateFeedback {
    readonly feedbackRepository: FeedbackRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.feedbackRepository = repositoryFactory.createFeedbackRepository();
    }

    async execute(input: CreateFeedbackInput): Promise<CreateFeedbackOutput> {
        Validators.required(input.messageId, "messageId");
        Validators.required(input.comment, "comment");
        Validators.range(input.rating, 1, 5, "rating");
        Validators.integer(input.rating, "rating");

        try {
            const feedback = new Feedback(
                input.messageId,
                input.rating,
                input.comment
            );

            await this.feedbackRepository.create(feedback);

            return { feedback };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.internalError("Erro ao criar feedback");
        }
    }
}