import Conversation from "../source/domain/Entity/Conversation";
import ConversationRepositoryInterface from "../source/domain/Interfaces/ConversationRepositoryInterface";
import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import CreateConversation from "../source/useCases/createConversation/CreateConversation";

describe("CreateConversation Use Case", () => {
  let mockRepositoryFactory: jest.Mocked<RepositoryFactoryInterface>;
  let mockConversationRepository: jest.Mocked<ConversationRepositoryInterface>;

  beforeEach(() => {
    mockConversationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepositoryInterface>;

    mockRepositoryFactory = {
      createConversationRepository: jest.fn().mockReturnValue(mockConversationRepository),
    } as unknown as jest.Mocked<RepositoryFactoryInterface>;
  });

  it("deve criar uma nova conversa e chamá-la no repositório", async () => {
    const useCase = new CreateConversation(mockRepositoryFactory);
    const input = {
        userId: "user-123",
        title: "Minha primeira conversa"
    };
    await useCase.execute(input);
    expect(mockRepositoryFactory.createConversationRepository).toHaveBeenCalledTimes(1);
    expect(mockConversationRepository.create).toHaveBeenCalledTimes(1);
    const createdConversation = mockConversationRepository.create.mock.calls[0][0];
    expect(createdConversation).toBeInstanceOf(Conversation);
    expect(createdConversation.userId).toBe("user-123");
    expect(createdConversation.title).toBe("Minha primeira conversa");
    expect(createdConversation.id).toBeDefined();
  });
});
