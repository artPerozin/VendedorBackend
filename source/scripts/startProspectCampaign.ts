import dotenv from "dotenv";
dotenv.config();

import Message, { MessageRole } from "../domain/Entity/Message";
import { GetContactsToProspectService } from "../domain/Services/Agendor/GetContactsToProspectService";
import FindOrCreateContact from "../domain/Services/Contact/FindOrCreateContact";
import SendWhatsappMessageService from "../domain/Services/Evolution/SendWhatsappMessageService";
import CreateMessageService from "../domain/Services/Message/CreateMessageService";
import GetFirstMessagesService from "../domain/Services/Message/GetFirstMessagesService";
import PostgreSQLConnection from "../infra/database/PostgreSQLConnection";
import DatabaseRepositoryFactory from "../infra/repository/DatabaseRepositoryFactory";

function cleanPhone(input: string): string {
    if (!input) return "";

    let phone = input.replace(/\D/g, "");

    if (phone.startsWith("55")) {
        return phone;
    }

    if (phone.startsWith("0")) {
        phone = phone.slice(1);
    }

    if (phone.length >= 10 && phone.length <= 11) {
        return "55" + phone;
    }

    return phone;
}

export async function runProspection() {
    const connection = new PostgreSQLConnection({
        user: process.env.DB_USERNAME ?? "",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_DATABASE ?? "",
        host: process.env.DB_HOST ?? "",
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    });

    const repositoryFactory = new DatabaseRepositoryFactory(connection);
    const getContactsService = new GetContactsToProspectService();
    const getMessagesService = new GetFirstMessagesService();
    const findOrCreateContact = new FindOrCreateContact(repositoryFactory);
    const createMessageService = new CreateMessageService(repositoryFactory);
    const sendMessageService = new SendWhatsappMessageService();

    try {
        const contactsResponse = await getContactsService.handle();
        const contacts = contactsResponse?.data ?? [];
        const messages = await getMessagesService.handle();

        if (!messages.length) {
            return;
        }

        for (const contact of contacts) {
            const rawPhone = contact.contact?.whatsapp ?? "";
            const whatsapp = cleanPhone(rawPhone);

            if (!whatsapp) {
                continue;
            }

            const message = messages[Math.floor(Math.random() * messages.length)];

            try {
                const contactModel = await findOrCreateContact.handle(whatsapp);

                if (!contactModel) {
                    continue;
                }
                
                await sendMessageService.handle(whatsapp, message);
                
                const aiMessage = new Message({
                    contactId: contactModel.id,
                    role: "model" as MessageRole,
                    content: message,
                    orderIndex: 1,
                });

                await createMessageService.handle(aiMessage);

            } catch (err) {
                continue;
            }
        }
    } catch (err) {
        process.exit(1);
    }
}