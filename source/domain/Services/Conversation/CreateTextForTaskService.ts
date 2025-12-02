import { Content, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import FormatHistoryForPrompt from "../Helpers/FormatHistoryForPrompt";

export default class CreateTextForTaskService {

    private ai: GoogleGenAI;
    private modelName: string;
    private formatHistoryForPrompt: FormatHistoryForPrompt;

    constructor(
        formatHistoryForPrompt?: FormatHistoryForPrompt
    ) {
        this.ai = new GoogleGenAI({});
        this.modelName = process.env.GEMINI_MODEL_FAST ?? "gemini-1.5-flash"; 
        this.formatHistoryForPrompt = formatHistoryForPrompt ?? new FormatHistoryForPrompt();
    }

    async handle(
        history: Content[],
        rewrittenQuestion: string,
        aiResponse: string
    ): Promise<string> {

        const historyText = this.formatHistoryForPrompt.handle(history);
        const lastUserMessage = rewrittenQuestion;

        const prompt = `
            A seguir está o histórico de conversa entre um cliente e uma assistente,
            seguido da última pergunta do usuário e da última resposta fornecida pela assistente.

            Sua tarefa é escrever um texto claro, direto e objetivo contendo:

            • **Dados importantes mencionados pelo cliente**, como:
              - CNPJ ou CPF
              - Número de máquinas
              - Localização
              - Modelo, tipo e uso das máquinas
              - Qualquer dado técnico relevante que o cliente tenha informado

            • **Interesse do cliente**, como:
              - Compra
              - Solicitação de orçamento
              - Manutenção
              - Peças
              - Suporte técnico
              - Reclamação
              - Dúvida específica

            • **Informações adicionais relevantes**, se existirem.

            **Regra crítica:** não invente dados. Extraia somente o que realmente aparece na conversa.

            -----------------------------
            HISTÓRICO DA CONVERSA:
            ${historyText}

            ÚLTIMA PERGUNTA DO USUÁRIO:
            ${lastUserMessage}

            ÚLTIMA RESPOSTA DA ASSISTENTE:
            ${aiResponse}
            -----------------------------

            Agora escreva apenas o texto solicitado, sem explicações adicionais.
        `;

        try {
            const result = await this.ai.models.generateContent({
                model: this.modelName,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { temperature: 0.1 },
            });

            return result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        } catch (error) {
            console.error("Erro ao escrever o texto da tarefa:", error);
            return "";
        }
    }
}
