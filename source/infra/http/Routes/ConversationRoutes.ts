import RepositoryFactory from "../../../domain/Interfaces/RepositoryFactoryInterface";
import ConversationController from "../../controller/ConversationController";
import Http from "../Http";
import ModelRoutes from "./ModelRoutes";

export default class ConversationRoutes implements ModelRoutes {

    protected conversationController: ConversationController;

    constructor(readonly http: Http, repositoryFactory: RepositoryFactory) {
        this.conversationController = new ConversationController(repositoryFactory);
    }

    init(): void {
        this.http.route("post", "/api/conversation/ask", true, async (params: any, body: any) => {
            return await this.conversationController.askQuestion(body);
        });

        this.http.route("post", "/api/conversation/create", true, async (params: any, body: any) => {
			return await this.conversationController.createConversation(body);
		});

        this.http.route("post", "/api/conversation/read", true, async (params: any, body: any) => {
            return await this.conversationController.listConversations(body);
        });
        
        this.http.route("post", "/api/conversation/update", true, async (params: any, body: any) => {
            return await this.conversationController.updateConversation(body);
        });

        this.http.route("delete", "/api/conversation/delete", true, async (params: any, body: any) => {
            return await this.conversationController.deleteConversation(body);
        });

        this.http.route("post", "/api/conversation/:id", true, async (params: any, body: any) => {
            return await this.conversationController.getMessagesFromConversation({ chatId: params.id });
        });
    }
}
