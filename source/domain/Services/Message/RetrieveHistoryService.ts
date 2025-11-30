import { Content } from "@google/genai";
import MessageRepositoryInterface from "../../Interfaces/MessageRepositoryInterface";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class RetrieveHistoryService {
    private messageRepository: MessageRepositoryInterface
    
    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.messageRepository = repositoryFactory.createMessageRepository();
    }

    async handle(contactId: string): Promise<Content[]> {
        return await this.messageRepository.retrieveHistory(contactId);
    }
}