import { Content } from "@google/genai";

export default class FormatHistoryForPrompt {
    async handle (history: Content[]): Promise<string> {
        return history
            .map(item => {
                const role = item.role === "user" ? "user" : "model";
                const text = item.parts?.[0]?.text || "";
                return `${role}: ${text}`;
            })
            .join("\n");
    }
}
