import CreatePersonService from "./CreatePersonService";
import { FindUserByPhoneNumberService } from "./FindUserByPhoneNumberService";

export default class FindOrCreateClient {
    private apiKey: string;
    private apiUrl: string;

    private findUserByPhoneNumberService: FindUserByPhoneNumberService;
    private createPersonService: CreatePersonService;

    constructor(
        findUserByPhoneNumberService?: FindUserByPhoneNumberService,
        createPersonService?: CreatePersonService
    ) {
        this.apiKey = process.env.AGENDOR_API_KEY ?? "";
        this.apiUrl = process.env.AGENDOR_API_URL ?? "";
        this.findUserByPhoneNumberService = findUserByPhoneNumberService ?? new FindUserByPhoneNumberService();
        this.createPersonService = createPersonService ?? new CreatePersonService();
        
        if (!this.apiKey) throw new Error("AGENDOR_API_KEY não configurada");
        if (!this.apiUrl) throw new Error("AGENDOR_API_URL não configurada");
    }

    async handle(name: string, phoneNumber: string): Promise<any> {
        const client = await this.findUserByPhoneNumberService.handle(phoneNumber);
        if (!client) await this.createPersonService.handle(name, phoneNumber);
    }
}
