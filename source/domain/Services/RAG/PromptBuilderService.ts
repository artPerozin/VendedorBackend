export default class PromptBuilderService {
    async handle(question: string, chunks: string[]): Promise<string> {
        return `
            Informações de Contexto (Use para responder APENAS se relevante):
            ${chunks.join("\n\n")}
            ---
            Pergunta do Usuário:
            ${question}
        `.trim();
    }
}