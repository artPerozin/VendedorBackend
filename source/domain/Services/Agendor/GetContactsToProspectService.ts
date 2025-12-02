export class GetContactsToProspectService {
    private apiKey: string;
    private apiUrl: string;
    private agendorOwnerId: number;

    constructor() {
        this.apiKey = process.env.AGENDOR_API_KEY ?? "";
        this.apiUrl = (process.env.AGENDOR_API_URL ?? "").replace(/\/+$/, "");
        const ownerId = process.env.AGENDOR_OWNER_ID ?? "";

        if (!this.apiKey) throw new Error("AGENDOR_API_KEY não configurada");
        if (!this.apiUrl) throw new Error("AGENDOR_API_URL não configurada");
        if (!ownerId) throw new Error("AGENDOR_OWNER_ID não configurada");

        this.agendorOwnerId = parseInt(ownerId);
    }

    async handle(): Promise<any> {
        const url = new URL(`${this.apiUrl}/people`);
        url.searchParams.append("userOwner", this.agendorOwnerId.toString());

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
            return { data: [] };
        }

        return data;
    }
}