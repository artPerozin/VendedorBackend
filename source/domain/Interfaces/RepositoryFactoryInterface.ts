import ChunkRepositoryInterface from "./ChunkRepositoryInterface";
import ContactRepositoryInterface from "./ContactRepositoryInterface";
import DocumentRepositoryInterface from "./DocumentRepositoryInterface";
import MessageRepositoryInterface from "./MessageRepositoryInterface";

export default interface RepositoryFactoryInterface {
    createDocumentRepository(): DocumentRepositoryInterface;
    createChunkRepository(): ChunkRepositoryInterface;
    createContactRepository(): ContactRepositoryInterface;
    createMessageRepository(): MessageRepositoryInterface;
}