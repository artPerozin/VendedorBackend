import ChunkRepositoryInterface from "./ChunkRepositoryInterface";
import ConversationRepositoryInterface from "./ConversationRepositoryInterface";

export default interface RepositoryFactoryInterface {
    createChunkRepository(): ChunkRepositoryInterface;
    createConversationRepository(): ConversationRepositoryInterface;
}