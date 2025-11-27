import Feedback from "../../../domain/Entity/Feedback";
import FeedbackRepositoryInterface from "../../../domain/Interfaces/FeedbackRepositoryInterface";

export default class FeedbackRepositoryMemory implements FeedbackRepositoryInterface {

    private feedbacks: Feedback[];

    constructor() {
        this.feedbacks = [];
    }
    
    async create(feedback: Feedback): Promise<void> {
        this.feedbacks.push(feedback);
    }

    async getAll(): Promise<Feedback[]> {
        return this.feedbacks;
    }
}