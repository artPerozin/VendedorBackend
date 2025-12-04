import Contact from "../../../domain/Entity/Contact";
import ContactRepositoryInterface from "../../../domain/Interfaces/ContactRepositoryInterface";
import { ErrorFactory } from "../../../shared/error/ErrorFactory";

export class ContactRepositoryMemory implements ContactRepositoryInterface {
    private contacts: Contact[] = [];

    async create(contact: Contact): Promise<Contact> {
        const existing = this.contacts.find(c => c.phoneNumber === contact.phoneNumber);
        
        if (existing) {
            throw ErrorFactory.alreadyExists("Contato", "numero de telefone", contact.phoneNumber);
        }

        this.contacts.push(contact);
        return contact;
    }

    async findById(id: string): Promise<Contact> {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) {
            throw ErrorFactory.notFound("Contato", id);
        }
        return contact;
    }

    async findByPhoneNumber(phoneNumber: string): Promise<Contact> {
        const contact = this.contacts.find(c => c.phoneNumber === phoneNumber);
        if (!contact) {
            throw ErrorFactory.notFound("Contato", phoneNumber);
        }
        return contact;
    }

    async setMessageSent(id: string): Promise<void> {
        const index = this.contacts.findIndex(c => c.id === id);
        if (index === -1) {
            throw ErrorFactory.notFound("Contato", id);
        }
        
        const contact = this.contacts[index];
        const updatedContact = new Contact({
            id: contact.id,
            phoneNumber: contact.phoneNumber,
            message_sent: true,
        });
        
        this.contacts[index] = updatedContact;
    }
    
    clear(): void {
        this.contacts = [];
    }

    getAll(): Contact[] {
        return [...this.contacts];
    }
}