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

        if (existing.length > 0) {
            throw ErrorFactory.alreadyExists(
                "Contato",
                "número de telefone",
                contact.phoneNumber
            );
        }

        const result = await this.connection.execute(
            `
            INSERT INTO contacts (id, phone_number, intervencao, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
            `,
            [contact.id, contact.phoneNumber, contact.intervencao, new Date(), new Date()]
        );

        if (!result.length) {
            throw ErrorFactory.internalError("Falha ao criar contato no banco.");
        }

        return this.mapRowToContact(result[0]);
    }


    async findById(id: string): Promise<Contact | null> {
        const rows = await this.connection.execute(
            "SELECT * FROM contacts WHERE id = $1;", 
            [id]
        );
        if (!rows.length) return null;
        return this.mapRowToContact(rows[0]);
    }
    
    async findByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
        const rows = await this.connection.execute(
            "SELECT * FROM contacts WHERE phone_number = $1;",
            [phoneNumber]
        );
        if (!rows.length) return null;
        return this.mapRowToContact(rows[0]);
    }

    async setIntervencao(id: string): Promise<void> {
        await this.connection.execute(
            "UPDATE contacts SET intervencao = true WHERE id = $1;",
            [id]
        )
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