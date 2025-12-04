import { v4 as uuid } from "uuid";

export default class Contact {
    readonly id: string;
    readonly phoneNumber: string;
    readonly message_sent: boolean;

    constructor(
        params : {
            id?: string;
            phoneNumber: string;
            message_sent?: boolean
        }
    ) {
        this.id = params.id || uuid();
        this.phoneNumber = params.phoneNumber;
        this.message_sent = params.message_sent || false;
    }
}
