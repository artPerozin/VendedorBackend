import RepositoryFactory from "../../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationController from "../../controller/ContactController";
import Http from "../Http";
import ModelRoutes from "./ModelRoutes";

export default class ContactRoutes implements ModelRoutes {

    protected conversationController: ConversationController;

    constructor(readonly http: Http, repositoryFactory: RepositoryFactory) {
        this.conversationController = new ConversationController(repositoryFactory);
    }

    init(): void {
        this.http.route("post", "/api/conversation/ask", true, async (params: any, body: any) => {
            return await this.conversationController.askQuestion(body);
        });
    }
}
