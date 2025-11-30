import Contact from "../Entity/Contact";

export default interface ContactRepositoryInterface {
    create(chat: Contact): Promise<Contact>;
    findById(id: string): Promise<Contact>;
    findByPhoneNumber(phoneNumber: string): Promise<Contact>;
}
