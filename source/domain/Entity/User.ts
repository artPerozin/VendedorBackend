import { v4 as uuid } from "uuid";

export default class User {
    readonly id: string;
    readonly email: string;
    readonly password: string;
    constructor(
        email: string,
        password: string,
        id?: string
    ) {
        if (!id) id = uuid();
        this.id = id;
        this.email = email;
        this.password = password;
    }
}