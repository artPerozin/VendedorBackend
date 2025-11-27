import Feedback from "../Entity/Feedback";

export default interface FeedbackRepositoryInterface {
    create(feedback: Feedback): Promise<void>;
    getAll(): Promise<Feedback[]>;
}
