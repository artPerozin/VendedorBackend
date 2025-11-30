import { Content, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import systemPrompts from "../../Enums/SystemPrompts";

export default class GeminiChatService {
    async handle(question: string, retrievedHistory: Content[]): Promise<GenerateContentResponse> {
        const ai = new GoogleGenAI({});
        const chat = ai.chats.create({
            model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
            history: retrievedHistory,
            config: {
                temperature: 0.3,
                systemInstruction: systemPrompts.VENDEDOR,
            },
        });
        const response = await chat.sendMessage({
            message: question
        });
        return response;
    }
}