import OpenAI from "openai";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import EmbeddingService from "../../domain/Services/EmbeddingService";
import ChunkService from "../../domain/Services/ChunkService";
import OpenAIChatService from "../../domain/Services/GeminiChatService";
import AskQuestionInput from "./AskQuestionInput";
import AskQuestionOutput from "./AskQuestionOutput";
import { Validators } from "../../shared/validator/Validators";
import { extractPdfText } from "../../domain/Services/extractTextFromPDF";
import RemoveStopWordsService from "../../domain/Services/removeStopwordsService";
import { ModelType } from "../../domain/Enums/ModelType";
import { TokenType } from "../../domain/Enums/TokenType";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { AppError } from "../../shared/error/AppError";

export default class AskQuestion {
    private repositoryFactory: RepositoryFactoryInterface;
    private embeddingService: EmbeddingService;
    private chunkService: ChunkService;
    private chatService: OpenAIChatService;

    constructor(
        repositoryFactory: RepositoryFactoryInterface,
        embeddingService?: EmbeddingService,
        chunkService?: ChunkService,
        chatService?: OpenAIChatService,
    ) {
        this.repositoryFactory = repositoryFactory;

        this.embeddingService =
            embeddingService ||
            new EmbeddingService(this.repositoryFactory, new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

        this.chunkService =
            chunkService ||
            new ChunkService(this.repositoryFactory);

        this.chatService =
            chatService ||
            new OpenAIChatService(this.repositoryFactory, new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
    }

    async execute(input: AskQuestionInput): Promise<AskQuestionOutput> {
        Validators.required(input.question, "question");
        Validators.required(input.conversationId, "conversationId");

        let fileText = "";
        
        if (input.file) {
            const file = input.file as Express.Multer.File;
            
            Validators.fileType(file, ["application/pdf"]);
            Validators.fileSize(file, 1_000_000);

            fileText = await extractPdfText(file);
        }

        try {
            const combinedText = [fileText, input.question].filter(Boolean).join(" ");
            const cleanedText = await RemoveStopWordsService(combinedText, "porBr");
            
            const queryEmbedding = await this.embeddingService.createEmbedding(
                cleanedText,
                ModelType.EMBEDDING_MODEL,
                TokenType.INPUT
            );

            const topChunks = await this.chunkService.findRelevantChunks(queryEmbedding);
            const contextIds = topChunks.map(c => c.id);

            const conversationRepository = this.repositoryFactory.createConversationRepository();
            const conversation = await conversationRepository.findById(input.conversationId);

            if (!conversation) {
                throw ErrorFactory.notFound("Conversa", input.conversationId);
            }

            const response = await this.chatService.chatWithConversation(
                conversation,
                ModelType.PROMPT_MODEL,
                input.question,
                input.mentorType,
                contextIds
            );

            return {
                answer: response.answer,
                conversationId: conversation.id,
                messageId: response.messageId
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.internalError("Erro ao processar pergunta");
        }
    }
}