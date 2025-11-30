import { v4 as uuid } from "uuid";

export default class Contact {
    readonly id: string;
    readonly phoneNumber: string;
    readonly intervencao: boolean;

    constructor(
        params : {
            id?: string;
            phoneNumber: string;
            intervencao?: boolean
        }
    ) {
        this.id = params.id || uuid();
        this.phoneNumber = params.phoneNumber;
        this.intervencao = params.intervencao || false;
    }
}
