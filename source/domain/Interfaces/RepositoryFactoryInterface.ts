import ChunkRepositoryInterface from "./ChunkRepositoryInterface";
import ContactRepositoryInterface from "./ContactRepositoryInterface";
import DocumentRepositoryInterface from "./DocumentRepositoryInterface";
import MessageRepositoryInterface from "./MessageRepositoryInterface";
import UserRepositoryInterface from "./UserRepositoryInterface";

export default interface RepositoryFactoryInterface {
    createDocumentRepository(): DocumentRepositoryInterface;
    createChunkRepository(): ChunkRepositoryInterface;
    createContactRepository(): ContactRepositoryInterface;
    createMessageRepository(): MessageRepositoryInterface;
    createUserRepository(): UserRepositoryInterface;
}