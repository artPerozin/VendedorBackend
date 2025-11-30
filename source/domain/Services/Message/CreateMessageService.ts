import Message from "../../Entity/Message";
import MessageRepositoryInterface from "../../Interfaces/MessageRepositoryInterface";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class CreateMessageService {
    private messageRepository: MessageRepositoryInterface
    
    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.messageRepository = repositoryFactory.createMessageRepository();
    }

    async handle(message: Message): Promise<void> {
        await this.messageRepository.addMessage(message);
    }
}