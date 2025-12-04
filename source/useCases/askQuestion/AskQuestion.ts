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
import SetIntervencaoService from "../../domain/Services/Conversation/SetIntervencaoService";
import FindOrCreateClient from "../../domain/Services/Agendor/FindOrCreateClient";
import CreateTextForTaskService from "../../domain/Services/Conversation/CreateTextForTaskService";
import { CreateTaskForPersonService } from "../../domain/Services/Agendor/CreateTaskForPersonService";
import SendWhatsappMessageService from "../../domain/Services/Evolution/SendWhatsappMessageService";

export default class AskQuestion {
    private readonly embeddingService: EmbeddingService;
    private readonly geminiChatService: GeminiChatService;
    private readonly promptBuilderService: PromptBuilderService;
    private readonly queryRewriteService: QueryRewriteService;
    private readonly setIntervencaoService: SetIntervencaoService;
    private readonly findOrCreateClient: FindOrCreateClient;
    private readonly createTextForTaskService: CreateTextForTaskService;
    private readonly createTaskForPersonService: CreateTaskForPersonService;
    private readonly sendWhatsappMessageService: SendWhatsappMessageService;

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
        findOrCreateClient?: FindOrCreateClient,
        createTextForTaskService?: CreateTextForTaskService,
        createTaskForPersonService?: CreateTaskForPersonService,
        sendWhatsappMessageService?: SendWhatsappMessageService,
        
        setIntervencaoService?: SetIntervencaoService,
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
        this.findOrCreateClient = findOrCreateClient ?? new FindOrCreateClient();
        this.createTextForTaskService = createTextForTaskService ?? new CreateTextForTaskService();
        this.createTaskForPersonService = createTaskForPersonService ?? new CreateTaskForPersonService();
        this.sendWhatsappMessageService = sendWhatsappMessageService ?? new SendWhatsappMessageService();
        
        this.setIntervencaoService = setIntervencaoService ?? new SetIntervencaoService(this.repositoryFactory);
        this.createMessageService = createMessageService ?? new CreateMessageService(this.repositoryFactory);
        this.findOrCreateContact = findOrCreateContact ?? new FindOrCreateContact(this.repositoryFactory);
        this.getLastMessageService = getLastMessageService ?? new GetLastMessageService(this.repositoryFactory);
        this.retrieveHistoryService = retrieveHistoryService ?? new RetrieveHistoryService(this.repositoryFactory);
        this.searchSimilarChunks = searchSimilarChunks ?? new SearchSimilarChunks(this.repositoryFactory);
    }

    async execute(input: AskQuestionInput): Promise<AskQuestionOutput> {
        console.log("[askQuestion] Iniciando execute()", { input });

        Validators.required(input.question, "question");
        Validators.required(input.phoneNumber, "phoneNumber");
        Validators.required(input.pushName, "pushName");

        try {
            console.log("[askQuestion] Buscando/criando contato...");
            const contact = await this.findOrCreateContact.handle(input.phoneNumber);
            console.log("[askQuestion] Contato retornado:", contact);

            console.log("[askQuestion] Buscando histórico...");
            const history = await this.retrieveHistoryService.handle(contact.id);
            console.log("[askQuestion] Histórico obtido:", history);

            console.log("[askQuestion] Reescrevendo pergunta...");
            const rewrittenQuestion = await this.queryRewriteService.handle(input.question, history);
            console.log("[askQuestion] Pergunta reescrita:", rewrittenQuestion);

            console.log("[askQuestion] Gerando embedding...");
            const queryVector = await this.embeddingService.handle(rewrittenQuestion);
            console.log("[askQuestion] Vetor gerado:", queryVector);

            console.log("[askQuestion] Buscando chunks similares...");
            const chunks = await this.searchSimilarChunks.handle(queryVector);
            console.log("[askQuestion] Chunks retornados:", chunks);

            console.log("[askQuestion] Construindo prompt...");
            const prompt = await this.promptBuilderService.handle(rewrittenQuestion, chunks);
            console.log("[askQuestion] Prompt final:", prompt);

            console.log("[askQuestion] Consultando GeminiChatService...");
            const aiResponse = await this.geminiChatService.handle(prompt, history);
            console.log("[askQuestion] Resposta da IA:", aiResponse);

            if (!aiResponse || !aiResponse.text) {
                console.log("[askQuestion] Resposta vazia da IA.");
                return { answer: "", contactId: contact.id };
            }

            console.log("[askQuestion] Obtendo última mensagem...");
            const lastMessage = await this.getLastMessageService.handle(contact.id);
            console.log("[askQuestion] Última mensagem: ");
            const lastIndex = lastMessage ? lastMessage.orderIndex : 0;
            console.log("[askQuestion] Último índice:", lastIndex);

            console.log("[askQuestion] Criando mensagem do usuário...");
            const userMessage = new Message({
                contactId: contact.id,
                role: "user" as MessageRole,
                content: input.question,
                orderIndex: lastIndex + 1,
            });
            await this.createMessageService.handle(userMessage);
            console.log("[askQuestion] Mensagem do usuário salva");

            console.log("[askQuestion] Criando mensagem da IA...");
            const aiMessage = new Message({
                contactId: contact.id,
                role: "model" as MessageRole,
                content: aiResponse.text,
                orderIndex: lastIndex + 2,
            });
            await this.createMessageService.handle(aiMessage);
            console.log("[askQuestion] Mensagem da IA salva");

            if (aiResponse.text.includes("[NECESSITA_INTERVENCAO]")) {
                console.log("[askQuestion] Intervenção detectada!");

                const mensagemLimpa = aiResponse.text.replace("[NECESSITA_INTERVENCAO]", "").trim();
                console.log("[askQuestion] Mensagem limpa:", mensagemLimpa);

                await this.findOrCreateClient.handle(input.pushName, input.phoneNumber);
                console.log("[askQuestion] Cliente criado/encontrado");

                const description = await this.createTextForTaskService.handle(history, rewrittenQuestion, aiResponse.text);
                console.log("[askQuestion] Descrição da tarefa:", description);

                await this.createTaskForPersonService.handle(input.pushName, input.phoneNumber, description);
                console.log("[askQuestion] Tarefa criada");

                await this.sendWhatsappMessageService.handle(input.phoneNumber, mensagemLimpa);
                console.log("[askQuestion] Mensagem enviada ao WhatsApp");

            } else {
                console.log("[askQuestion] Enviando resposta normal ao WhatsApp...");
                await this.sendWhatsappMessageService.handle(input.phoneNumber, aiResponse.text);
                console.log("[askQuestion] Resposta enviada");
            }

            console.log("[askQuestion] Finalizando com sucesso");
            return {
                answer: aiResponse.text,
                contactId: contact.id,
            };

        } catch (error) {
            console.error("[askQuestion] Erro capturado:", error);

            if (error instanceof AppError) {
                throw error;
            }
            throw ErrorFactory.internalError("Erro ao processar pergunta");
        }
    }
}