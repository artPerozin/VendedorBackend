import MessageRepositoryInterface from "../../Interfaces/MessageRepositoryInterface";
import Message from "../../Entity/Message";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class GetLastMessageService {
    private messageRepository: MessageRepositoryInterface
    
    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.messageRepository = repositoryFactory.createMessageRepository();
    }

    async handle(contactId: string): Promise<Message | null> {
        return await this.messageRepository.getLastMessage(contactId);
    }
}