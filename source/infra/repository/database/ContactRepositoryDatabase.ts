import Contact from "../../../domain/Entity/Contact";
import ContactRepositoryInterface from "../../../domain/Interfaces/ContactRepositoryInterface";
import { ErrorFactory } from "../../../shared/error/ErrorFactory";
import Connection from "../../database/Connection";

export default class ContactRepositoryDatabase implements ContactRepositoryInterface {
    constructor(protected connection: Connection) {}

    async create(contact: Contact): Promise<Contact> {
        const existing = await this.connection.execute(
            "SELECT * FROM contacts WHERE phone_number = $1;",
            [contact.phoneNumber]
        );
        
        if (existing.length) {
            throw ErrorFactory.alreadyExists("Contato", "numero de telefone", contact.phoneNumber);
        }

        await this.connection.execute(
            `INSERT INTO contacts
                (id, phone_number, intervencao, created_at, updated_at)
            VALUES
                ($1, $2, $3, $4, $5);`,
            [contact.id, contact.phoneNumber, contact.intervencao, new Date(), new Date()]
        );
        
        return await this.findById(contact.id);
    }

    async findById(id: string): Promise<Contact> {
        const rows = await this.connection.execute(
            "SELECT * FROM contacts WHERE id = $1;", 
            [id]
        );
        if (!rows.length) throw ErrorFactory.notFound("Contato", id);
        return this.mapRowToContact(rows[0]);
    }
    
    async findByPhoneNumber(phoneNumber: string): Promise<Contact> {
        const rows = await this.connection.execute(
            "SELECT * FROM contacts WHERE phone_number = $1;",
            [phoneNumber]
        );
        if (!rows.length) throw ErrorFactory.notFound("Contato", phoneNumber);
        return this.mapRowToContact(rows[0]);
    }

    private mapRowToContact(r: any): Contact {
        const contactInput = {
            id: r.id,
            phoneNumber: r.phone_number,
            intervencao: r.intervencao
        };
        
        return new Contact(contactInput);
    }
}