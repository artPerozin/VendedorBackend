export default class CreatePersonService {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.AGENDOR_API_KEY ?? "";
        this.apiUrl = process.env.AGENDOR_API_URL ?? "";

        if (!this.apiKey) throw new Error("AGENDOR_API_KEY não configurada");
        if (!this.apiUrl) throw new Error("AGENDOR_API_URL não configurada");
    }

    async handle(name: string, phoneNumber: string): Promise<any> {
        if (!name) throw new Error("Nome não pode ser vazio");
        if (!phoneNumber) throw new Error("Número de telefone não pode ser vazio");

        const response = await fetch(`${this.apiUrl}/people`, {
            method: "POST",
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": "Node.js/Agendor",
            },
            body: JSON.stringify({
                name,
                contact: { whatsapp: phoneNumber },
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
        }

        return await response.json();
    }
}
