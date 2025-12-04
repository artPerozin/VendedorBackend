import Contact from "../Entity/Contact";

export default interface ContactRepositoryInterface {
    create(chat: Contact): Promise<Contact>;
    findById(id: string): Promise<Contact| null>;
    findByPhoneNumber(phoneNumber: string): Promise<Contact| null>;
    setMessageSent(id: string): Promise<void>;
}
