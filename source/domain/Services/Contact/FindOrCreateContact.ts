import Contact from "../../Entity/Contact";
import ContactRepositoryInterface from "../../Interfaces/ContactRepositoryInterface";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class FindOrCreateContact {
    private contactRepository: ContactRepositoryInterface
    
    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.contactRepository = repositoryFactory.createContactRepository();
    }

    async handle(phoneNumber: string): Promise<Contact> {
        let contact = await this.contactRepository.findByPhoneNumber(phoneNumber);
        if (!contact) {
            const newContact = new Contact({
                phoneNumber: phoneNumber
            })
            await this.contactRepository.create(newContact);
            contact = newContact;
        }
        return contact;
    }
}