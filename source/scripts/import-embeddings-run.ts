import "dotenv/config";
import { OpenAI } from "openai";
import PostgreSQLConnection from "../infra/database/PostgreSQLConnection";
import ConfigDatabase from "../infra/database/ConfigDatabase";
import DatabaseRepositoryFactory from "../infra/repository/DatabaseRepositoryFactory";
import ImportEmbeddings from "./import-embeddings";

const configDatabase: ConfigDatabase = {
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "pgsql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
};

function printHeader() {
    console.log("\n" + "=".repeat(70));
    console.log("🤖 SISTEMA DE IMPORTAÇÃO DE EMBEDDINGS - BOK");
    console.log("=".repeat(70) + "\n");
}

function printConfig(inputFolder: string) {
    console.log("⚙️  CONFIGURAÇÃO:\n");
    console.log(`   📂 Diretório de entrada: ${inputFolder}`);
    console.log(`   🗄️  Database: ${configDatabase.database}`);
    console.log(`   🏠 Host: ${configDatabase.host}:${configDatabase.port}`);
    console.log(`   👤 Usuário: ${configDatabase.user}`);
    console.log("");
}

async function main() {
    printHeader();

    try {
        const inputFolder = process.argv[2] || "./docs";
        printConfig(inputFolder);

        console.log("🔌 Conectando ao OpenAI...");
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log("   ✅ Conexão estabelecida\n");

        console.log("🔌 Conectando ao banco de dados...");
        const connection = new PostgreSQLConnection(configDatabase);
        console.log("   ✅ Conexão estabelecida\n");

        const repositoryFactory = new DatabaseRepositoryFactory(connection);
        const importer = new ImportEmbeddings(repositoryFactory, openai);

        await importer.run(inputFolder);

        console.log("🔒 Fechando conexão com o banco de dados...");
        await connection.close();
        console.log("   ✅ Conexão fechada\n");

        console.log("✨ Processo finalizado com sucesso!\n");
        process.exit(0);
    } catch (err) {
        console.error("\n" + "=".repeat(70));
        console.error("❌ ERRO CRÍTICO NO PROCESSAMENTO");
        console.error("=".repeat(70) + "\n");
        
        if (err instanceof Error) {
            console.error("📋 Detalhes do erro:");
            console.error(`   Mensagem: ${err.message}`);
            if (err.stack) {
                console.error(`\n   Stack trace:`);
                console.error(err.stack.split("\n").map(line => `   ${line}`).join("\n"));
            }
        } else {
            console.error("   Erro desconhecido:", err);
        }
        
        console.error("\n" + "=".repeat(70) + "\n");
        process.exit(1);
    }
}

main();