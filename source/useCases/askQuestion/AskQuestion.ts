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
        console.log('🚀 [AskQuestion] Iniciando execução');
        console.log('📥 [AskQuestion] Input recebido:', {
            question: input.question.substring(0, 50) + '...',
            phoneNumber: input.phoneNumber,
            pushName: input.pushName
        });

        Validators.required(input.question, "question");
        Validators.required(input.phoneNumber, "phoneNumber");
        Validators.required(input.pushName, "pushName");

        console.log('✅ [AskQuestion] Validações passaram');

        try {
            console.log('🔍 [AskQuestion] Buscando ou criando contato...');
            const contact = await this.findOrCreateContact.handle(input.phoneNumber);
            console.log('✅ [AskQuestion] Contato:', { id: contact.id, intervencao: contact.intervencao });

            if (contact.intervencao) {
                console.log('⚠️ [AskQuestion] Contato requer intervenção humana, encerrando');
                return { answer: "", contactId: contact.id };
            }

            console.log('📜 [AskQuestion] Recuperando histórico de mensagens...');
            const history = await this.retrieveHistoryService.handle(contact.id);
            console.log('✅ [AskQuestion] Histórico recuperado:', { messageCount: history.length });

            console.log('✍️ [AskQuestion] Reescrevendo pergunta...');
            const rewrittenQuestion = await this.queryRewriteService.handle(input.question, history);
            console.log('✅ [AskQuestion] Pergunta reescrita:', rewrittenQuestion.substring(0, 100) + '...');

            console.log('🧮 [AskQuestion] Gerando embedding da pergunta...');
            const queryVector = await this.embeddingService.handle(rewrittenQuestion);
            console.log('✅ [AskQuestion] Embedding gerado:', { vectorLength: queryVector.length });

            console.log('🔎 [AskQuestion] Buscando chunks similares...');
            const chunks = await this.searchSimilarChunks.handle(queryVector);
            console.log('✅ [AskQuestion] Chunks encontrados:', { chunkCount: chunks.length });

            console.log('📝 [AskQuestion] Construindo prompt...');
            const prompt = await this.promptBuilderService.handle(rewrittenQuestion, chunks);
            console.log('✅ [AskQuestion] Prompt construído:', { promptLength: prompt.length });

            console.log('🤖 [AskQuestion] Enviando para Gemini...');
            const aiResponse = await this.geminiChatService.handle(prompt, history);
            console.log('✅ [AskQuestion] Resposta do Gemini recebida:', { 
                hasText: !!aiResponse?.text,
                textLength: aiResponse?.text?.length || 0
            });

            if (!aiResponse || !aiResponse.text) {
                console.log('⚠️ [AskQuestion] Resposta vazia do Gemini');
                return { answer: "", contactId: contact.id };
            }

            console.log('📊 [AskQuestion] Obtendo última mensagem...');
            const lastMessage = await this.getLastMessageService.handle(contact.id);
            const lastIndex = lastMessage ? lastMessage.orderIndex : 0;
            console.log('✅ [AskQuestion] Último índice:', lastIndex);

            console.log('💾 [AskQuestion] Salvando mensagem do usuário...');
            const userMessage = new Message({
                contactId: contact.id,
                role: "user" as MessageRole,
                content: input.question,
                orderIndex: lastIndex,
            });
            await this.createMessageService.handle(userMessage);
            console.log('✅ [AskQuestion] Mensagem do usuário salva');

            console.log('💾 [AskQuestion] Salvando mensagem do assistente...');
            const aiMessage = new Message({
                contactId: contact.id,
                role: "model" as MessageRole,
                content: aiResponse.text,
                orderIndex: lastIndex + 1,
            });
            await this.createMessageService.handle(aiMessage);
            console.log('✅ [AskQuestion] Mensagem do assistente salva');

            if (aiResponse.text.includes("[NECESSITA_INTERVENCAO]")) {
                console.log('🚨 [AskQuestion] Intervenção necessária detectada');
                
                const mensagemLimpa = aiResponse.text.replace("[NECESSITA_INTERVENCAO]", "").trim();
                console.log('🧹 [AskQuestion] Mensagem limpa:', mensagemLimpa.substring(0, 50) + '...');
                
                console.log('🔒 [AskQuestion] Definindo flag de intervenção...');
                await this.setIntervencaoService.handle(contact.id);
                console.log('✅ [AskQuestion] Flag de intervenção definida');
                
                console.log('👤 [AskQuestion] Criando cliente no Agendor...');
                await this.findOrCreateClient.handle(input.pushName, input.phoneNumber);
                console.log('✅ [AskQuestion] Cliente criado no Agendor');
                
                console.log('📄 [AskQuestion] Gerando descrição da tarefa...');
                const description = await this.createTextForTaskService.handle(history, rewrittenQuestion, aiResponse.text);
                console.log('✅ [AskQuestion] Descrição gerada:', { descriptionLength: description.length });
                
                console.log('📋 [AskQuestion] Criando tarefa no Agendor...');
                await this.createTaskForPersonService.handle(input.pushName, input.phoneNumber, description);
                console.log('✅ [AskQuestion] Tarefa criada no Agendor');
                
                console.log('📤 [AskQuestion] Enviando mensagem limpa via WhatsApp...');
                await this.sendWhatsappMessageService.handle(input.phoneNumber, mensagemLimpa);
                console.log('✅ [AskQuestion] Mensagem enviada via WhatsApp');
            } else {
                console.log('📤 [AskQuestion] Enviando resposta via WhatsApp...');
                await this.sendWhatsappMessageService.handle(input.phoneNumber, aiResponse.text);
                console.log('✅ [AskQuestion] Resposta enviada via WhatsApp');
            }

            console.log('🎉 [AskQuestion] Execução concluída com sucesso');
            return {
                answer: aiResponse.text,
                contactId: contact.id,
            };

        } catch (error) {
            console.error('❌ [AskQuestion] Erro durante execução:', error);
            console.error('❌ [AskQuestion] Stack trace:', error instanceof Error ? error.stack : 'N/A');
            
            if (error instanceof AppError) {
                console.error('❌ [AskQuestion] AppError detectado:', {
                    message: error.message,
                    statusCode: error.statusCode
                });
                throw error;
            }
            
            console.error('❌ [AskQuestion] Erro interno não tratado');
            throw ErrorFactory.internalError("Erro ao processar pergunta");
        }
    }
}