import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import Http from "./Http";
import FeedbackRoutes from "./Routes/FeedbackRoutes";
import ConversationRoutes from "./Routes/ConversationRoutes";
import UserRoutes from "./Routes/UserRoutes";
export default class Router {

	protected userRoutes: UserRoutes;
	protected conversationRoutes: ConversationRoutes;
	protected feedbackRouter: FeedbackRoutes;

	constructor(readonly http: Http, readonly repositoryFactory: RepositoryFactoryInterface) {
		this.userRoutes = new UserRoutes(this.http, this.repositoryFactory);
		this.conversationRoutes = new ConversationRoutes(this.http, this.repositoryFactory);
		this.feedbackRouter = new FeedbackRoutes(this.http, this.repositoryFactory);
	}

	init() {
		this.http.route("get", "/api/", false, async () => {
			return {
				message: "welcome"
			}
		});
		this.userRoutes.init();
		this.conversationRoutes.init();
		this.feedbackRouter.init();
	}
}