import { Content, GoogleGenAI } from "@google/genai";
import FormatHistoryForPrompt from "../Helpers/FormatHistoryForPrompt";

export default class QueryRewriteService {
    private ai: GoogleGenAI;
    private modelName: string;
    private formatHistoryForPrompt: FormatHistoryForPrompt;

    constructor(
        formatHistoryForPrompt?: FormatHistoryForPrompt
    ) {
        this.ai =   new GoogleGenAI({});
        this.modelName = process.env.GEMINI_MODEL_FAST ?? "gemini-1.5-flash"; 
        this.formatHistoryForPrompt = formatHistoryForPrompt ?? new FormatHistoryForPrompt();
    }

    async handle(originalQuestion: string, history: Content[]): Promise<string> {
        if (!history || history.length === 0) {
            return originalQuestion;
        }

        const relevantHistory = history.slice(-6); 
        const historyText = this.formatHistoryForPrompt.handle(relevantHistory);

        const prompt = `
            Abaixo está um histórico de conversa e uma nova pergunta do usuário.
            Sua tarefa é reescrever a "Nova Pergunta" para que ela seja uma frase independente, clara e completa, substituindo pronomes (ele, isso, aquilo) pelos substantivos corretos mencionados no histórico.

            Regras Rígidas:
            1. NÃO responda à pergunta. Apenas reescreva.
            2. Mantenha o idioma original da pergunta (Português).
            3. Se a pergunta já for clara e independente, repita-a exatamente como é.
            4. Não adicione introduções como "A pergunta reescrita é:". Retorne APENAS o texto.

            Histórico da Conversa:
            ${historyText}

            Nova Pergunta: 
            ${originalQuestion}
        `;

        try {
            const model = this.ai.models.generateContent({
                model: this.modelName,
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.1,
                }
            });

            const result = await model;
            const rewrittenText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            return rewrittenText ? rewrittenText.trim() : originalQuestion;

        } catch (error) {
            console.error("Erro ao reescrever query:", error);
            return originalQuestion;
        }
    }
}