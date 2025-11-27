import Message from "../source/domain/Entity/Message";
import ConversationRepositoryMemory from "../source/infra/repository/memory/ConversationRepositoryMemory";
import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import GetMessagesFromConversation from "../source/useCases/getMessagesFromConversation/GetMessagesFromConversation";

describe("GetMessagesFromConversation with Memory Repository", () => {
    let useCase: GetMessagesFromConversation;
    let conversationRepo: ConversationRepositoryMemory;
    let mockRepositoryFactory: jest.Mocked<RepositoryFactoryInterface>;

    beforeEach(() => {
        conversationRepo = new ConversationRepositoryMemory();

        mockRepositoryFactory = {
            createConversationRepository: jest.fn().mockReturnValue(conversationRepo),
        } as any;

        useCase = new GetMessagesFromConversation(mockRepositoryFactory);
    });

    it("should return messages from a conversation", async () => {
        const chatId = "conversation-123";

        jest.spyOn(conversationRepo, "getMessages").mockResolvedValueOnce([
            new Message({
                chatId,
                role: "user",
                content: "Hello",
                orderIndex: 0,
                id: "msg-1",
                createdAt: new Date("2025-01-01"),
            }),
            new Message({
                chatId,
                role: "assistant",
                content: "World",
                orderIndex: 1,
                id: "msg-2",
                createdAt: new Date("2025-01-02"),
            }),
        ]);

        const result = await useCase.execute({ chatId });

        expect(result.data).toHaveLength(2);
        expect(result.data[0].content).toBe("Hello");
        expect(result.data[1].content).toBe("World");
    });

    it("should return empty array when no messages exist", async () => {
        const chatId = "empty";

        const result = await useCase.execute({ chatId });

        expect(result.data).toEqual([]);
    });

    it("should return messages with correct properties", async () => {
        const chatId = "conversation-789";
        const createdAt = new Date("2025-01-15");

        const msg = new Message({
            chatId,
            role: "system",
            content: "System message",
            orderIndex: 0,
            id: "sys-msg",
            createdAt,
            contextIds: ["ctx-1", "ctx-2"],
            metadata: { foo: "bar" },
        });

        jest.spyOn(conversationRepo, "getMessages").mockResolvedValueOnce([msg]);

        const result = await useCase.execute({ chatId });

        const returned = result.data[0];

        expect(returned.id).toBe("sys-msg");
        expect(returned.chatId).toBe(chatId);
        expect(returned.role).toBe("system");
        expect(returned.content).toBe("System message");
        expect(returned.orderIndex).toBe(0);
        expect(returned.createdAt).toEqual(createdAt);
        expect(returned.contextIds).toEqual(["ctx-1", "ctx-2"]);
        expect(returned.metadata).toEqual({ foo: "bar" });
    });

    it("should call repository factory to create conversation repository", () => {
        expect(mockRepositoryFactory.createConversationRepository).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when repository fails", async () => {
        const chatId = "conversation-error";

        jest.spyOn(conversationRepo, "getMessages").mockRejectedValue(
            new Error("Database connection failed")
        );

        await expect(useCase.execute({ chatId })).rejects.toThrow("Database connection failed");
    });
});
