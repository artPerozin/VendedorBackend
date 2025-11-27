import Chunk from "../../../domain/Entity/Chunk";
import Feedback from "../../../domain/Entity/Feedback";
import FeedbackRepositoryInterface from "../../../domain/Interfaces/FeedbackRepositoryInterface";
import Connection from "../../database/Connection";

export default class FeedbackRepositoryDatabase implements FeedbackRepositoryInterface {
    constructor(protected connection: Connection) {
    }

    async create(feedback: Feedback): Promise<void> {
        await this.connection.execute("insert into feedbacks (id, message_id, rating, comment) values ($1, $2, $3, $4);", [feedback.id, feedback.messageId, feedback.rating, feedback.comment]);
    }

    async getAll(): Promise<Feedback[]> {
        return await this.connection.execute("select * from feedbacks order by created_at")
    }
}