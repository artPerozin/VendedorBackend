import ChunkRepositoryInterface from "../../domain/Interfaces/ChunkRepositoryInterface";
import ConversationRepositoryInterface from "../../domain/Interfaces/ConversationRepositoryInterface";
import FeedbackRepositoryInterface from "../../domain/Interfaces/FeedbackRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import TokenRepositoryInterface from "../../domain/Interfaces/TokenRepositoryInterface";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import ChunkRepositoryMemory from "./memory/ChunkRepositoryMemory";
import ConversationRepositoryMemory from "./memory/ConversationRepositoryMemory";
import FeedbackRepositoryMemory from "./memory/FeedbackRepositoryMemory";
import TokenRepositoryMemory from "./memory/TokenRepositoryMemory";
import UserRepositoryMemory from "./memory/UserRepositoryMemory";

export default class MemoryRepositoryFactory implements RepositoryFactoryInterface {

    readonly userRepository: UserRepositoryInterface;
    readonly tokenRepository: TokenRepositoryInterface;
    readonly chunkRepository: ChunkRepositoryInterface;
    readonly conversationRepository: ConversationRepositoryInterface;
    readonly feedbackRepository: FeedbackRepositoryInterface;

    constructor() {
        this.userRepository = new UserRepositoryMemory();
        this.tokenRepository = new TokenRepositoryMemory();
        this.chunkRepository = new ChunkRepositoryMemory();
        this.conversationRepository = new ConversationRepositoryMemory();
        this.feedbackRepository = new FeedbackRepositoryMemory();
    }
    
    createUserRepository(): UserRepositoryInterface { return this.userRepository; }
    createTokenRepository(): TokenRepositoryInterface { return this.tokenRepository; }
    createChunkRepository(): ChunkRepositoryInterface { return this.chunkRepository; }
    createConversationRepository(): ConversationRepositoryInterface { return this.conversationRepository; }
    createFeedbackRepository(): FeedbackRepositoryInterface { return this.feedbackRepository; }
}