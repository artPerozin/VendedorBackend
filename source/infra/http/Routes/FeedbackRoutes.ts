import RepositoryFactory from "../../../domain/Interfaces/RepositoryFactoryInterface";
import FeedbackController from "../../controller/FeedbackController";
import Http from "../Http";
import ModelRoutes from "./ModelRoutes";

export default class FeedbackRoutes implements ModelRoutes {

    protected feedbackController: FeedbackController;

    constructor(readonly http: Http, repositoryFactory: RepositoryFactory) {
        this.feedbackController = new FeedbackController(repositoryFactory);
    }

    init(): void {
        this.http.route("post", "/api/feedback/create", true, async (params: any, body: any) => {
            return await this.feedbackController.createFeedback(body);
        });
    }
}
