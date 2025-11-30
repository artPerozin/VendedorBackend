import AskQuestionInput from "./AskQuestionInput";
import AskQuestionOutput from "./AskQuestionOutput";

import { Validators } from "../../shared/validator/Validators";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { AppError } from "../../shared/error/AppError";

import GeminiChatService from "../../domain/Services/RAG/GeminiChatService";
import Message, { MessageRole } from "../../domain/Entity/Message";
import QueryRewriteService from "../../domain/Services/RAG/QueryRewriteService";
import PromptBuilderService from "../../domain/Services/RAG/PromptBuilderService";
import EmbeddingService from "../../domain/Services/RAG/EmbeddingService";
import SearchSimilarChunks from "../../domain/Services/RAG/SearchSimilarChunks";

import FindOrCreateContact from "../../domain/Services/Contact/FindOrCreateContact";
import RetrieveHistoryService from "../../domain/Services/Message/RetrieveHistoryService";
import GetLastMessageService from "../../domain/Services/Message/GetLastMessageService";
import CreateMessageService from "../../domain/Services/Message/CreateMessageService";

import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";

export default class AskQuestion {
    private readonly embeddingService: EmbeddingService;
    private readonly geminiChatService: GeminiChatService;
    private readonly promptBuilderService: PromptBuilderService;
    private readonly queryRewriteService: QueryRewriteService;

    private readonly createMessageService: CreateMessageService;
    private readonly findOrCreateContact: FindOrCreateContact;
    private readonly getLastMessageService: GetLastMessageService;
    private readonly retrieveHistoryService: RetrieveHistoryService;
    private readonly searchSimilarChunks: SearchSimilarChunks;

    constructor(
        private readonly repositoryFactory: RepositoryFactoryInterface,

        embeddingService?: EmbeddingService,
        geminiChatService?: GeminiChatService,
        promptBuilderService?: PromptBuilderService,
        queryRewriteService?: QueryRewriteService,

        createMessageService?: CreateMessageService,
        findOrCreateContact?: FindOrCreateContact,
        getLastMessageService?: GetLastMessageService,
        retrieveHistoryService?: RetrieveHistoryService,
        searchSimilarChunks?: SearchSimilarChunks,
    ) {
        this.embeddingService = embeddingService ?? new EmbeddingService();
        this.geminiChatService = geminiChatService ?? new GeminiChatService();
        this.promptBuilderService = promptBuilderService ?? new PromptBuilderService();
        this.queryRewriteService = queryRewriteService ?? new QueryRewriteService();

        this.createMessageService = createMessageService ?? new CreateMessageService(this.repositoryFactory);
        this.findOrCreateContact = findOrCreateContact ?? new FindOrCreateContact(this.repositoryFactory);
        this.getLastMessageService = getLastMessageService ?? new GetLastMessageService(this.repositoryFactory);
        this.retrieveHistoryService = retrieveHistoryService ?? new RetrieveHistoryService(this.repositoryFactory);
        this.searchSimilarChunks = searchSimilarChunks ?? new SearchSimilarChunks(this.repositoryFactory);
    }

    async execute(input: AskQuestionInput): Promise<AskQuestionOutput> {
        Validators.required(input.question, "question");
        Validators.required(input.contactId, "contactId");
        Validators.required(input.phoneNumber, "phoneNumber");

        try {
            const contact = await this.findOrCreateContact.handle(input.phoneNumber);

            if (contact.intervencao) return { answer: "", contactId: contact.id };

            const history = await this.retrieveHistoryService.handle(contact.id);
            const rewrittenQuestion = await this.queryRewriteService.handle(input.question, history);
            const queryVector = await this.embeddingService.handle(rewrittenQuestion);
            const chunks = await this.searchSimilarChunks.handle(queryVector);
            const prompt = await this.promptBuilderService.handle(input.question, chunks);
            const aiResponse = await this.geminiChatService.handle(prompt, history);

            if (!aiResponse || !aiResponse.text) return { answer: "", contactId: contact.id };

            const lastMessage = await this.getLastMessageService.handle(contact.id);
            const lastIndex = lastMessage ? lastMessage.orderIndex : 0;

            const userMessage = new Message({
                contactId: contact.id,
                role: "user" as MessageRole,
                content: input.question,
                orderIndex: lastIndex,
            });

            await this.createMessageService.handle(userMessage);

            const aiMessage = new Message({
                contactId: contact.id,
                role: "assistant" as MessageRole,
                content: aiResponse.text,
                orderIndex: lastIndex + 1,
            });

            await this.createMessageService.handle(aiMessage);

            return {
                answer: aiResponse.text,
                contactId: contact.id,
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.internalError("Erro ao processar pergunta");
        }
    }
}
