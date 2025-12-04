import ContactRepositoryInterface from "../../Interfaces/ContactRepositoryInterface";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class SetMessageSent {
    private contactRepository: ContactRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.contactRepository = repositoryFactory.createContactRepository();
    }

    async handle(contactId: string): Promise<void> {
        await this.contactRepository.setMessageSent(contactId);
    }
}
