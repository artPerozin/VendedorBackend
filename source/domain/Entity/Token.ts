import { v4 as uuid } from "uuid";
import { ModelType } from "../Enums/ModelType";
import { TokenType } from "../Enums/TokenType";

export default class Token {
    readonly id: string;
    readonly model: ModelType;
    readonly type: TokenType;
    readonly amount: number;
    readonly createdAt: Date;

    constructor(
        model: ModelType,
        type: TokenType,
        amount: number,
        id?: string
    ) {
        if (!id) id = uuid();
        this.id = id;
        this.model = model;
        this.type = type;
        this.amount = amount;
        this.createdAt = new Date();
    }
}