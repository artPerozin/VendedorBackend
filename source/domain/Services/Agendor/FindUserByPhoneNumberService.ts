export class FindUserByPhoneNumberService {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.AGENDOR_API_KEY ?? "";
        this.apiUrl = (process.env.AGENDOR_API_URL ?? "").replace(/\/+$/, "");

        if (!this.apiKey) throw new Error("AGENDOR_API_KEY não configurada");
        if (!this.apiUrl) throw new Error("AGENDOR_API_URL não configurada");
    }

    async handle(phoneNumber: string): Promise<any[]> {
        if (!phoneNumber) throw new Error("Número de telefone não pode ser vazio");

        const url = new URL(`${this.apiUrl}/people`);
        url.searchParams.append("whatsapp", phoneNumber);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": "Node.js/Agendor",
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            return [];
        }

        return data.data;
    }
}