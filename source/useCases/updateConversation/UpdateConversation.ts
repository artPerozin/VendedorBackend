import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import { AppError } from "../../shared/error/AppError";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { Validators } from "../../shared/validator/Validators";
import UpdateConversationInput from "./UpdateConversationInput";

export default class UpdateConversation {
    readonly conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async execute(input: UpdateConversationInput): Promise<void> {
        Validators.required(input.conversationId, "conversationId");
        Validators.uuid(input.conversationId, "conversationId");
        Validators.required(input.title, "title");
        Validators.minLength(input.title, 1, "title");

        try {
            const exists = await this.conversationRepository.findById(input.conversationId);
            
            if (!exists) {
                throw ErrorFactory.notFound("Conversa", input.conversationId);
            }

            await this.conversationRepository.updateConversationTitle(
                input.conversationId,
                input.title
            );
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.databaseError("Erro ao atualizar conversa");
        }
    }
}