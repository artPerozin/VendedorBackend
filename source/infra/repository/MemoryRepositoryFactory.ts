import ChunkRepositoryInterface from "../../domain/Interfaces/ChunkRepositoryInterface";
import ContactRepositoryInterface from "../../domain/Interfaces/ContactRepositoryInterface";
import DocumentRepositoryInterface from "../../domain/Interfaces/DocumentRepositoryInterface";
import MessageRepositoryInterface from "../../domain/Interfaces/MessageRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import Connection from "../database/Connection";
import ChunkRepositoryMemory from "./memory/ChunkRepositoryMemory";
import ContactRepositoryMemory from "./memory/ContactRepositoryMemory";
import DocumentRepositoryMemory from "./memory/DocumentRepositoryMemory";
import MessageRepositoryMemory from "./memory/MessageRepositoryMemory";

export default class MemoryRepositoryFactory implements RepositoryFactoryInterface {

    readonly documentRepository: DocumentRepositoryInterface;
    readonly chunkRepository: ChunkRepositoryInterface;
    readonly contactRepository: ContactRepositoryInterface;
    readonly messageRepository: MessageRepositoryInterface;

    constructor() {
        this.documentRepository = new DocumentRepositoryMemory();
        this.chunkRepository = new ChunkRepositoryMemory();
        this.contactRepository = new ContactRepositoryMemory();
        this.messageRepository = new MessageRepositoryMemory();
    }

    createDocumentRepository(): DocumentRepositoryInterface { return this.documentRepository; }
    createChunkRepository(): ChunkRepositoryInterface { return this.chunkRepository; }
    createContactRepository(): ContactRepositoryInterface { return this.contactRepository; }
    createMessageRepository(): MessageRepositoryInterface { return this.messageRepository; }
}