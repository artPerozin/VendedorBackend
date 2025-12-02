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

async function main() {
    console.log("🚀 Iniciando rotina de prospecção...\n");

    const connection = new PostgreSQLConnection({
        user: process.env.DB_USERNAME ?? "",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_DATABASE ?? "",
        host: process.env.DB_HOST ?? "",
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    });

    console.log("📡 Conectando ao banco PostgreSQL...");
    const repositoryFactory = new DatabaseRepositoryFactory(connection);
    console.log("✅ Conexão estabelecida!\n");

    const getContactsService = new GetContactsToProspectService();
    const getMessagesService = new GetFirstMessagesService();
    const findOrCreateContact = new FindOrCreateContact(repositoryFactory);
    const createMessageService = new CreateMessageService(repositoryFactory);
    const sendMessageService = new SendWhatsappMessageService();

    try {
        console.log("📥 Buscando contatos para prospectar...");
        const contactsResponse = await getContactsService.handle();
        const contacts = contactsResponse?.data ?? [];
        console.log(`📌 Contatos encontrados: ${contacts.length}\n`);

        console.log("💬 Buscando mensagens iniciais...");
        const messages = await getMessagesService.handle();
        console.log(`📌 Mensagens disponíveis: ${messages.length}\n`);

        if (!messages.length) {
            console.log("⚠ Nenhuma mensagem encontrada. Encerrando...");
            return;
        }

        for (const contact of contacts) {
            const rawPhone = contact.contact?.whatsapp ?? "";
            const whatsapp = cleanPhone(rawPhone);

            console.log("--------------------------------------------------");
            console.log(`👤 Contato: ${contact.name ?? "Sem nome"}`);
            console.log(`📱 Telefone bruto: ${rawPhone}`);
            console.log(`📞 Telefone limpo:  ${whatsapp}`);

            if (!whatsapp) {
                console.log("⚠ Telefone inválido. Pulando...\n");
                continue;
            }

            const message = messages[Math.floor(Math.random() * messages.length)];
            console.log(`💬 Mensagem escolhida: "${message}"\n`);

            try {
                console.log("🔎 Buscando/criando contato no banco...");
                const contactModel = await findOrCreateContact.handle(whatsapp);

                if (!contactModel) {
                    console.log("⚠ Não foi possível obter/criar o contato. Pulando...\n");
                    continue;
                }
                console.log("✅ Contato ID:", contactModel.id);

                console.log("📤 Enviando WhatsApp...");
                await sendMessageService.handle(whatsapp, message);
                console.log("✅ Mensagem enviada!");

                console.log("📝 Salvando histórico...");
                const aiMessage = new Message({
                    contactId: contactModel.id,
                    role: "model" as MessageRole,
                    content: message,
                    orderIndex: 1,
                });

                await createMessageService.handle(aiMessage);
                console.log("✅ Mensagem registrada!\n");

            } catch (err) {
                console.error("❌ Erro processando telefone:", whatsapp);
                console.error(err);
                console.log("--------------------------------------------------\n");
                continue;
            }
        }

        console.log("\n✨ Rotina finalizada com sucesso!");
    } catch (err) {
        console.error("🔥 Erro fatal:", err);
        process.exit(1);
    }
}

main().catch(err => {
    console.error("🔥 Erro inesperado:", err);
    process.exit(1);
});
