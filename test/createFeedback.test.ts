import Feedback from "../source/domain/Entity/Feedback";
import FeedbackRepositoryInterface from "../source/domain/Interfaces/FeedbackRepositoryInterface";
import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import CreateFeedback from "../source/useCases/createFeedback/CreateFeedback";

describe("CreateFeedback", () => {
  let mockFeedbackRepository: jest.Mocked<FeedbackRepositoryInterface>;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactoryInterface>;
  let createFeedback: CreateFeedback;

  beforeEach(() => {
    mockFeedbackRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<FeedbackRepositoryInterface>;

    mockRepositoryFactory = {
      createFeedbackRepository: jest.fn(() => mockFeedbackRepository),
    } as unknown as jest.Mocked<RepositoryFactoryInterface>;

    createFeedback = new CreateFeedback(mockRepositoryFactory);
  });

  it("deve criar um feedback com sucesso", async () => {
    const input = {
      messageId: "123",
      rating: 5,
      comment: "Excelente resposta!",
    };

    await createFeedback.execute(input);

    expect(mockFeedbackRepository.create).toHaveBeenCalledTimes(1);
    const feedbackCreated = mockFeedbackRepository.create.mock.calls[0][0];
    expect(feedbackCreated).toBeInstanceOf(Feedback);
    expect(feedbackCreated.messageId).toBe("123");
    expect(feedbackCreated.rating).toBe(5);
    expect(feedbackCreated.comment).toBe("Excelente resposta!");
  });

  it("deve lançar erro se messageId for inválido", async () => {
    const input = { messageId: "", rating: 4, comment: "ok" };
    await expect(createFeedback.execute(input as any))
      .rejects
      .toThrow("O campo 'messageId' é obrigatório");
  });

  it("deve lançar erro se rating for menor que 1", async () => {
    const input = { messageId: "1", rating: 0, comment: "Ruim" };
    await expect(createFeedback.execute(input as any))
      .rejects
      .toThrow("O campo 'rating' deve estar entre 1 e 5");
  });

  it("deve lançar erro se rating for maior que 5", async () => {
    const input = { messageId: "1", rating: 10, comment: "Perfeito" };
    await expect(createFeedback.execute(input as any))
      .rejects
      .toThrow("O campo 'rating' deve estar entre 1 e 5");
  });

  it("deve lançar erro se comment for inválido", async () => {
    const input = { messageId: "1", rating: 3, comment: "" };
    await expect(createFeedback.execute(input as any))
      .rejects
      .toThrow("O campo 'comment' é obrigatório");
  });
});
