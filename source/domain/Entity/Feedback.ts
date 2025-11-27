import { v4 as uuid } from "uuid";
import { Validators } from "../../shared/validator/Validators";

export default class Feedback {
    readonly id: string;
    readonly messageId: string;
    readonly rating: number;
    readonly comment: string;

    constructor(messageId: string, rating: number, comment: string, id?: string) {
        Validators.required(messageId, "messageId");
        Validators.required(comment, "comment");
        Validators.range(rating, 0, 5, "rating");

        this.id = id || uuid();
        this.messageId = messageId;
        this.rating = rating;
        this.comment = comment;
    }
}
