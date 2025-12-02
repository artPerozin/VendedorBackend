import ChunkRepositoryInterface from "../../domain/Interfaces/ChunkRepositoryInterface";
import ContactRepositoryInterface from "../../domain/Interfaces/ContactRepositoryInterface";
import DocumentRepositoryInterface from "../../domain/Interfaces/DocumentRepositoryInterface";
import MessageRepositoryInterface from "../../domain/Interfaces/MessageRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import { ChunkRepositoryMemory } from "./memory/ChunkRepositoryMemory";
import { ContactRepositoryMemory } from "./memory/ContactRepositoryMemory";
import { DocumentRepositoryMemory } from "./memory/DocumentRepositoryMemory";
import { MessageRepositoryMemory } from "./memory/MessageRepositoryMemory";
import UserRepositoryMemory from "./memory/UserRepositoryMemory";

export default class MemoryRepositoryFactory implements RepositoryFactoryInterface {

    readonly documentRepository: DocumentRepositoryInterface;
    readonly chunkRepository: ChunkRepositoryInterface;
    readonly contactRepository: ContactRepositoryInterface;
    readonly messageRepository: MessageRepositoryInterface;
    readonly userRepository: UserRepositoryInterface;

    constructor() {
        this.documentRepository = new DocumentRepositoryMemory();
        this.chunkRepository = new ChunkRepositoryMemory();
        this.contactRepository = new ContactRepositoryMemory();
        this.messageRepository = new MessageRepositoryMemory();
        this.userRepository = new UserRepositoryMemory();
    }

    createDocumentRepository(): DocumentRepositoryInterface { return this.documentRepository; }
    createChunkRepository(): ChunkRepositoryInterface { return this.chunkRepository; }
    createContactRepository(): ContactRepositoryInterface { return this.contactRepository; }
    createMessageRepository(): MessageRepositoryInterface { return this.messageRepository; }
    createUserRepository(): UserRepositoryInterface { return this.userRepository; }
}