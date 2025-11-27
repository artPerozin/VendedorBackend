import Conversation from "../source/domain/Entity/Conversation";
import ConversationRepositoryInterface from "../source/domain/Interfaces/ConversationRepositoryInterface";
import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import ListConversation from "../source/useCases/listConversation/ListConversation";

describe("ListConversation Use Case", () => {
  let mockRepositoryFactory: jest.Mocked<RepositoryFactoryInterface>;
  let mockConversationRepository: jest.Mocked<ConversationRepositoryInterface>;
  let listConversation: ListConversation;

  beforeEach(() => {
    mockConversationRepository = {
      getAllByUserId: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepositoryInterface>;

    mockRepositoryFactory = {
      createConversationRepository: jest.fn().mockReturnValue(mockConversationRepository),
    } as unknown as jest.Mocked<RepositoryFactoryInterface>;

    listConversation = new ListConversation(mockRepositoryFactory);
  });

  it("deve retornar todas as conversas pertencentes ao usuário informado", async () => {
    const userId = "user-1";
    const mockConversations = [
      new Conversation(userId, "Conversa 1"),
      new Conversation(userId, "Conversa 2"),
    ];

    mockConversationRepository.getAllByUserId.mockResolvedValue(mockConversations);

    const input = { userId: userId };
    const result = await listConversation.execute(input);

    expect(mockRepositoryFactory.createConversationRepository).toHaveBeenCalledTimes(1);
    expect(mockConversationRepository.getAllByUserId).toHaveBeenCalledWith(userId);
    expect(mockConversationRepository.getAllByUserId).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: mockConversations });
  });

  it("deve retornar um array vazio quando o usuário não possui conversas", async () => {
    const userId = "user-2";
    mockConversationRepository.getAllByUserId.mockResolvedValue([]);

    const input = { userId: userId };
    const result = await listConversation.execute(input);

    expect(mockConversationRepository.getAllByUserId).toHaveBeenCalledWith(userId);
    expect(mockConversationRepository.getAllByUserId).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: [] });
  });
});
