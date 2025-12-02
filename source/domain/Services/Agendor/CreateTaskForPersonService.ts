import CreatePersonService from "./CreatePersonService";
import { FindUserByPhoneNumberService } from "./FindUserByPhoneNumberService";

export class CreateTaskForPersonService {
    private apiKey: string;
    private apiUrl: string;
    private agendorOwnerId: number;
    private taskType: string;
    private findUserByPhoneNumberService: FindUserByPhoneNumberService;
    private createPersonService: CreatePersonService;

    constructor(
        findUserByPhoneNumberService?: FindUserByPhoneNumberService,
        createPersonService?: CreatePersonService,
    ) {
        this.apiKey = process.env.AGENDOR_API_KEY ?? "";
        this.apiUrl = (process.env.AGENDOR_API_URL ?? "").replace(/\/+$/, "");
        const responsableOwnerId = process.env.AGENDOR_RESPONSABLE_OWNER_ID ?? "";
        this.taskType = process.env.AGENDOR_TASK_TYPE ?? "";

        if (!this.apiKey) throw new Error("AGENDOR_API_KEY não configurada");
        if (!this.apiUrl) throw new Error("AGENDOR_API_URL não configurada");
        if (!responsableOwnerId) throw new Error("AGENDOR_RESPONSABLE_OWNER_ID não configurada");
        if (!this.taskType) throw new Error("AGENDOR_TASK_TYPE não configurada");

        this.agendorOwnerId = parseInt(responsableOwnerId);
        this.findUserByPhoneNumberService = findUserByPhoneNumberService ?? new FindUserByPhoneNumberService();
        this.createPersonService = createPersonService ?? new CreatePersonService();
    }

    async handle(name: string, phoneNumber: string, description: string): Promise<any> {
        let person = await this.findUserByPhoneNumberService.handle(phoneNumber);
        let personData: any = person.length > 0 ? person[0] : null;

        if (!personData || !personData.id) {
            const createResult = await this.createPersonService.handle(name, phoneNumber);

            if (createResult?.data?.id) {
                personData = { id: createResult.data.id };
            } else {
                throw new Error("Criação de pessoa retornou resposta sem ID válido");
            }
        }

        if (!personData || !personData.id) {
            throw new Error("Não foi possível obter ID válido da pessoa no Agendor");
        }

        const personId = personData.id;
        const url = `${this.apiUrl}/people/${personId}/tasks`;
        const dueDate = new Date().toISOString();

        const payload = {
            assigned_users: [this.agendorOwnerId],
            text: description,
            type: this.taskType,
            due_date: dueDate,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
        }

        return await response.json();
    }
}