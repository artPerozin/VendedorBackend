export default class SendWhatsappMessageService {
    private baseUrl: string;
    private apiKey: string;
    private instance: string;

    constructor() {
        this.baseUrl  = process.env.EVOLUTION_API_URL ?? "";
        this.apiKey   = process.env.EVOLUTION_API_KEY ?? "";
        this.instance = process.env.EVOLUTION_INSTANCE ?? "";

        if (!this.baseUrl) throw new Error("EVOLUTION_API_URL não configurada");
        if (!this.apiKey) throw new Error("EVOLUTION_API_KEY não configurada");
        if (!this.instance) throw new Error("EVOLUTION_INSTANCE não configurada");
    }

    async handle(phoneNumber: string, text: string): Promise<any> {
        if (!phoneNumber) throw new Error("phoneNumber não pode ser vazio");
        if (!text) throw new Error("O texto da mensagem não pode ser vazio");

        const url = `${this.baseUrl}/message/sendText/${this.instance}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": this.apiKey,
            },
            body: JSON.stringify({
                number: phoneNumber,
                text: text,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
        }

        return await response.json();
    }
}
