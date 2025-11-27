import { v4 as uuid } from "uuid";

export default class Conversation {
    readonly id: string;
    readonly userId: string;
    public title: string;

    constructor(userId: string, title?: string, id?: string) {
        this.id = id || uuid();
        this.userId = userId;
        this.title = title || "new Chat"
    }

    setTitle(title: string): void {
        this.title = title;
    }
}
