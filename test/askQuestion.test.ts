import { ModelType } from "../source/domain/Enums/ModelType";
import { TokenType } from "../source/domain/Enums/TokenType";
import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import MemoryRepositoryFactory from "../source/infra/repository/MemoryRepositoryFactory";
import AskQuestion from "../source/useCases/askQuestion/AskQuestion";
import AskQuestionInput from "../source/useCases/askQuestion/AskQuestionInput";
import { extractPdfText } from "../source/domain/Services/extractTextFromPDF";
import Conversation from "../source/domain/Entity/Conversation";
import removeStopwordsService from "../source/domain/Services/removeStopwordsService";

// Mocks
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      }),
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Resposta simulada via mock" } }],
        }),
      },
    },
  }));
});

jest.mock("../source/domain/Services/extractTextFromPDF", () => ({
  extractPdfText: jest.fn().mockResolvedValue("Texto extraído do PDF sobre educação"),
}));

jest.mock("../source/domain/Services/removeStopwordsService", () => 
  jest.fn().mockImplementation((text: string) => Promise.resolve(text))
);

// Mock Services
class MockEmbeddingService {
  async createEmbedding(text: string, model: ModelType, tokenType: TokenType) {
    return [0.1, 0.2, 0.3];
  }
}

class MockChunkService {
  async findRelevantChunks(embedding: number[]) {
    return [
      { chunk: "Contexto 1: Educação é fundamental para o desenvolvimento sustentável." },
      { chunk: "Contexto 2: ODS 4 visa garantir educação inclusiva e de qualidade." },
      { chunk: "Contexto 3: A meta é promover oportunidades de aprendizagem ao longo da vida." },
    ];
  }
}

class MockChatService {
  private repositoryFactory: RepositoryFactoryInterface;

  constructor(repositoryFactory: RepositoryFactoryInterface) {
    this.repositoryFactory = repositoryFactory;
  }

  async chatWithConversation(
    conversation: any,
    model: ModelType,
    userPrompt: string,
    mentorType: string
  ) {
    const conversationRepo = this.repositoryFactory.createConversationRepository();
    
    const userMessage = {
      id: `msg-user-${Date.now()}`,
      conversationId: conversation.id,
      role: "user",
      content: userPrompt,
      orderIndex: await this.getNextOrderIndex(conversation.id),
      createdAt: new Date()
    };
    await conversationRepo.addMessage(conversation.id, userMessage as any);
    
    const simulatedAnswer = `Resposta ${mentorType.toLowerCase()} sobre: ${userPrompt.substring(0, 50)}...`;
    const assistantMessage = {
      id: `msg-assistant-${Date.now()}`,
      conversationId: conversation.id,
      role: "assistant",
      content: simulatedAnswer,
      orderIndex: await this.getNextOrderIndex(conversation.id),
      createdAt: new Date()
    };
    await conversationRepo.addMessage(conversation.id, assistantMessage as any);
    
    return {
      answer: simulatedAnswer,
      messageId: assistantMessage.id
    };
  }

  private async getNextOrderIndex(conversationId: string): Promise<number> {
    const conversationRepo = this.repositoryFactory.createConversationRepository();
    const messages = await conversationRepo.getMessages(conversationId);
    return messages.length;
  }
}

// Test Suite
describe("AskQuestion Use Case", () => {
  let askQuestion: AskQuestion;
  let repositoryFactory: RepositoryFactoryInterface;
  let mockEmbeddingService: MockEmbeddingService;
  let mockChunkService: MockChunkService;
  let mockChatService: MockChatService;
  let testConversationId: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    repositoryFactory = new MemoryRepositoryFactory();
    const conversationRepo = repositoryFactory.createConversationRepository();
    
    testConversationId = "test-conversation-id";
    const conversation = new Conversation("user-test", "Test Conversation", testConversationId);
    await conversationRepo.create(conversation);

    mockEmbeddingService = new MockEmbeddingService();
    mockChunkService = new MockChunkService();
    mockChatService = new MockChatService(repositoryFactory);

    askQuestion = new AskQuestion(
      repositoryFactory,
      mockEmbeddingService as any,
      mockChunkService as any,
      mockChatService as any
    );
  });

  describe("Validação de entrada", () => {
    test("Deve lançar erro quando pergunta estiver vazia", async () => {
      const input: AskQuestionInput = {
        question: "",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await expect(askQuestion.execute(input)).rejects.toThrow("O campo 'question' é obrigatório");
    });

    test("Deve lançar erro quando pergunta for undefined", async () => {
      const input: AskQuestionInput = {
        question: undefined as any,
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await expect(askQuestion.execute(input)).rejects.toThrow("O campo 'question' é obrigatório");
    });

    test("Deve lançar erro quando conversationId não existir", async () => {
      const input: AskQuestionInput = {
        question: "Pergunta válida",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: "conversa-inexistente",
      };

      await expect(askQuestion.execute(input)).rejects.toThrow("Conversa com identificador 'conversa-inexistente' não encontrado");
    });
  });

  describe("Processamento de perguntas simples", () => {
    test("Deve processar pergunta válida e retornar resposta", async () => {
      const input: AskQuestionInput = {
        question: "Qual o impacto do ODS 4 na educação?",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      const output = await askQuestion.execute(input);

      expect(output.answer).toContain("Resposta generativo");
      expect(output.conversationId).toBe(testConversationId);
      expect(output.messageId).toBeDefined();
      expect(removeStopwordsService).toHaveBeenCalledWith(
        expect.stringContaining("Qual o impacto do ODS 4"),
        "porBr"
      );
    });

    test("Deve processar pergunta com mentor REFLEXIVO", async () => {
      const input: AskQuestionInput = {
        question: "Como posso contribuir para a educação de qualidade?",
        mentorType: "REFLEXIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      const output = await askQuestion.execute(input);

      expect(output.answer).toContain("Resposta reflexivo");
      expect(output.conversationId).toBe(testConversationId);
    });
  });

  describe("Processamento de PDF", () => {
    test("Deve rejeitar arquivo com formato inválido", async () => {
      const input: AskQuestionInput = {
        question: "Pergunta com arquivo inválido",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
        file: {
          mimetype: "text/plain",
          size: 500,
          buffer: Buffer.from("conteúdo texto"),
          originalname: "teste.txt"
        } as Express.Multer.File,
      };

      await expect(askQuestion.execute(input)).rejects.toThrow(
        "Tipo de arquivo inválido. Tipos permitidos: application/pdf"
      );
    });

    test("Deve rejeitar PDF maior que 1MB", async () => {
      const input: AskQuestionInput = {
        question: "Pergunta com PDF grande",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
        file: {
          mimetype: "application/pdf",
          size: 1_500_000, // 1.5MB
          buffer: Buffer.alloc(1_500_000),
          originalname: "arquivo-grande.pdf"
        } as Express.Multer.File,
      };

      await expect(askQuestion.execute(input)).rejects.toThrow(
        "O arquivo deve ter no máximo 1.00MB (atual: 1.50MB)"
      );
    });

    test("Deve aceitar e processar PDF válido", async () => {
      const mockFile: Express.Multer.File = {
        mimetype: "application/pdf",
        size: 500_000,
        buffer: Buffer.from("%PDF-1.4 conteúdo simulado"),
        originalname: "documento.pdf",
        fieldname: "file",
        encoding: "7bit",
        destination: "",
        filename: "documento.pdf",
        path: "",
        stream: {} as any,
      };

      const input: AskQuestionInput = {
        question: "Qual o conteúdo deste documento?",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
        file: mockFile,
      };

      const output = await askQuestion.execute(input);

      expect(extractPdfText).toHaveBeenCalledWith(mockFile);
      expect(removeStopwordsService).toHaveBeenCalledWith(
        expect.stringContaining("Texto extraído do PDF"),
        "porBr"
      );
      expect(output.answer).toBeDefined();
      expect(output.conversationId).toBe(testConversationId);
    });

    test("Deve combinar texto do PDF com a pergunta para embedding", async () => {
      const mockFile: Express.Multer.File = {
        mimetype: "application/pdf",
        size: 300_000,
        buffer: Buffer.from("%PDF-1.4"),
        originalname: "relatorio.pdf",
        fieldname: "file",
        encoding: "7bit",
        destination: "",
        filename: "relatorio.pdf",
        path: "",
        stream: {} as any,
      };

      const input: AskQuestionInput = {
        question: "Resuma as principais conclusões",
        mentorType: "REFLEXIVO",
        userId: "user-test",
        conversationId: testConversationId,
        file: mockFile,
      };

      await askQuestion.execute(input);

      expect(removeStopwordsService).toHaveBeenCalledWith(
        expect.stringContaining("Texto extraído do PDF"),
        "porBr"
      );
      expect(removeStopwordsService).toHaveBeenCalledWith(
        expect.stringContaining("Resuma as principais conclusões"),
        "porBr"
      );
    });
  });

  describe("Gerenciamento de conversas", () => {
    test("Deve salvar mensagens do usuário e assistente no histórico", async () => {
      const conversationRepo = repositoryFactory.createConversationRepository();
      
      const input: AskQuestionInput = {
        question: "Primeira pergunta da conversa",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input);
      
      const messages = await conversationRepo.getMessages(testConversationId);

      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toContain("Primeira pergunta");
      expect(messages[1].role).toBe("assistant");
      expect(messages[1].content).toBeDefined();
    });

    test("Deve manter histórico em múltiplas interações", async () => {
      const conversationRepo = repositoryFactory.createConversationRepository();

      const input1: AskQuestionInput = {
        question: "Primeira pergunta sobre ODS 4",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input1);

      const input2: AskQuestionInput = {
        question: "Segunda pergunta sobre educação inclusiva",
        mentorType: "REFLEXIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input2);

      const messages = await conversationRepo.getMessages(testConversationId);

      expect(messages.length).toBe(4); // 2 pares de user/assistant
      expect(messages[0].role).toBe("user");
      expect(messages[1].role).toBe("assistant");
      expect(messages[2].role).toBe("user");
      expect(messages[3].role).toBe("assistant");
      expect(messages[0].orderIndex).toBe(0);
      expect(messages[3].orderIndex).toBe(3);
    });

    test("Deve isolar mensagens entre diferentes conversas", async () => {
      const conversationRepo = repositoryFactory.createConversationRepository();
      
      // Cria segunda conversa
      const conversationId2 = "test-conversation-2";
      const conversation2 = new Conversation("user-test-2", "Second Conversation", conversationId2);
      await conversationRepo.create(conversation2);

      const input1: AskQuestionInput = {
        question: "Pergunta na conversa 1",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      const input2: AskQuestionInput = {
        question: "Pergunta na conversa 2",
        mentorType: "REFLEXIVO",
        userId: "user-test-2",
        conversationId: conversationId2,
      };

      await askQuestion.execute(input1);
      await askQuestion.execute(input2);

      const messages1 = await conversationRepo.getMessages(testConversationId);
      const messages2 = await conversationRepo.getMessages(conversationId2);

      expect(messages1.length).toBe(2);
      expect(messages2.length).toBe(2);
      expect(messages1[0].content).toContain("conversa 1");
      expect(messages2[0].content).toContain("conversa 2");
    });
  });

  describe("Integração de serviços", () => {
    test("Deve utilizar embedding service para processar texto", async () => {
      const spyEmbedding = jest.spyOn(mockEmbeddingService, 'createEmbedding');
      
      const input: AskQuestionInput = {
        question: "Teste de embedding",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input);

      expect(spyEmbedding).toHaveBeenCalledWith(
        expect.any(String),
        ModelType.EMBEDDING_MODEL,
        TokenType.INPUT
      );
    });

    test("Deve buscar chunks relevantes baseados no embedding", async () => {
      const spyChunk = jest.spyOn(mockChunkService, 'findRelevantChunks');
      
      const input: AskQuestionInput = {
        question: "Qual a importância da educação?",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input);

      expect(spyChunk).toHaveBeenCalledWith([0.1, 0.2, 0.3]);
    });

    test("Deve passar contexto dos chunks para o chat service", async () => {
      const spyChatService = jest.spyOn(mockChatService, 'chatWithConversation');
      
      const input: AskQuestionInput = {
        question: "Como melhorar a educação?",
        mentorType: "REFLEXIVO",
        userId: "user-test",
        conversationId: testConversationId,
      };

      await askQuestion.execute(input);
        expect(spyChatService).toHaveBeenCalledWith(
          expect.any(Object),
          ModelType.PROMPT_MODEL,
          "Como melhorar a educação?",
          "REFLEXIVO",
          expect.any(Array)
        );
    });
  });

  describe("Fluxo completo (end-to-end)", () => {
    test("Deve executar fluxo completo: pergunta + PDF + histórico", async () => {
      const conversationRepo = repositoryFactory.createConversationRepository();
      
      const mockFile: Express.Multer.File = {
        mimetype: "application/pdf",
        size: 400_000,
        buffer: Buffer.from("%PDF-1.4"),
        originalname: "estudo-educacao.pdf",
        fieldname: "file",
        encoding: "7bit",
        destination: "",
        filename: "estudo-educacao.pdf",
        path: "",
        stream: {} as any,
      };

      const input: AskQuestionInput = {
        question: "Com base neste documento, quais são as estratégias mais eficazes?",
        mentorType: "GENERATIVO",
        userId: "user-test",
        conversationId: testConversationId,
        file: mockFile,
      };

      const output = await askQuestion.execute(input);

      expect(extractPdfText).toHaveBeenCalled();
      expect(removeStopwordsService).toHaveBeenCalled();
      expect(output.answer).toBeDefined();
      expect(output.conversationId).toBe(testConversationId);
      expect(output.messageId).toBeDefined();

      const messages = await conversationRepo.getMessages(testConversationId);
      expect(messages.length).toBe(2);
      expect(messages[0].role).toBe("user");
      expect(messages[1].role).toBe("assistant");
    });
  });
});