import RepositoryFactory from "../../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationController from "../../controller/ContactController";
import Http from "../Http";
import { webhookMiddleware } from "../Middleware/WebhookTransformerMiddleware";
import ModelRoutes from "./ModelRoutes";

export default class ContactRoutes implements ModelRoutes {

    protected conversationController: ConversationController;

    constructor(readonly http: Http, repositoryFactory: RepositoryFactory) {
        this.conversationController = new ConversationController(repositoryFactory);
    }

    init(): void {
        this.http.route("post", "/api/conversation/messages-upsert", false, async (params: any, body: any) => {
        const input = webhookMiddleware(body);
        if (!input) {
          return { success: true, message: 'Mensagem ignorada' };
        }
        return await this.conversationController.askQuestion(input);
      });
    }
}
