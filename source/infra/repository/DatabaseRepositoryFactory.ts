import ChunkRepositoryInterface from "../../domain/Interfaces/ChunkRepositoryInterface";
import ContactRepositoryInterface from "../../domain/Interfaces/ContactRepositoryInterface";
import DocumentRepositoryInterface from "../../domain/Interfaces/DocumentRepositoryInterface";
import MessageRepositoryInterface from "../../domain/Interfaces/MessageRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import Connection from "../database/Connection";
import ChunkRepositoryDatabase from "./database/ChunkRepositoryDatabase";
import ContactRepositoryDatabase from "./database/ContactRepositoryDatabase";
import DocumentRepositoryDatabase from "./database/DocumentRepositoryDatabase";
import MessageRepositoryDatabase from "./database/MessageRepositoryDatabase";

export default class DatabaseRepositoryFactory implements RepositoryFactoryInterface {

    readonly documentRepository: DocumentRepositoryInterface;
    readonly chunkRepository: ChunkRepositoryInterface;
    readonly contactRepository: ContactRepositoryInterface;
    readonly messageRepository: MessageRepositoryInterface;

    constructor(connection: Connection) {
        this.documentRepository = new DocumentRepositoryDatabase(connection);
        this.chunkRepository = new ChunkRepositoryDatabase(connection);
        this.contactRepository = new ContactRepositoryDatabase(connection);
        this.messageRepository = new MessageRepositoryDatabase(connection);
    }

    createDocumentRepository(): DocumentRepositoryInterface { return this.documentRepository; }
    createChunkRepository(): ChunkRepositoryInterface { return this.chunkRepository; }
    createContactRepository(): ContactRepositoryInterface { return this.contactRepository; }
    createMessageRepository(): MessageRepositoryInterface { return this.messageRepository; }
}