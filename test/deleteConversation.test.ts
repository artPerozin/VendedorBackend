import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import ConversationRepositoryInterface from "../source/domain/Interfaces/ConversationRepositoryInterface";
import DeleteConversation from "../source/useCases/deleteConversation/DeleteConversation";
import DeleteConversationInput from "../source/useCases/deleteConversation/DeleteConversationInput";

describe("DeleteConversation Use Case", () => {
  let mockRepositoryFactory: jest.Mocked<RepositoryFactoryInterface>;
  let mockConversationRepository: jest.Mocked<ConversationRepositoryInterface>;
  let deleteConversation: DeleteConversation;

  beforeEach(() => {
    mockConversationRepository = {
      deleteConversation: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepositoryInterface>;

    mockRepositoryFactory = {
      createConversationRepository: jest.fn().mockReturnValue(mockConversationRepository),
    } as unknown as jest.Mocked<RepositoryFactoryInterface>;

    deleteConversation = new DeleteConversation(mockRepositoryFactory);
  });

  it("deve chamar o método deleteConversation do repositório com chatId e userId corretos", async () => {
    const input: DeleteConversationInput = {
      chatId: "chat-123",
      userId: "user-123",
    };

    await deleteConversation.execute(input);

    expect(mockRepositoryFactory.createConversationRepository).toHaveBeenCalledTimes(1);
    expect(mockConversationRepository.deleteConversation).toHaveBeenCalledTimes(1);
    expect(mockConversationRepository.deleteConversation).toHaveBeenCalledWith("chat-123", "user-123");
  });

  it("não deve lançar erro quando o repositório executa corretamente", async () => {
    mockConversationRepository.deleteConversation.mockResolvedValue();

    const input: DeleteConversationInput = {
      chatId: "chat-456",
      userId: "user-456",
    };

    await expect(deleteConversation.execute(input)).resolves.not.toThrow();

    expect(mockConversationRepository.deleteConversation).toHaveBeenCalledWith("chat-456", "user-456");
  });

  it("deve lançar erro se o repositório falhar ao deletar", async () => {
    mockConversationRepository.deleteConversation.mockRejectedValue(new Error("Falha ao deletar"));

    const input: DeleteConversationInput = {
      chatId: "chat-789",
      userId: "user-789",
    };

    await expect(deleteConversation.execute(input)).rejects.toThrow("Falha ao deletar");

    expect(mockConversationRepository.deleteConversation).toHaveBeenCalledWith("chat-789", "user-789");
  });
});
