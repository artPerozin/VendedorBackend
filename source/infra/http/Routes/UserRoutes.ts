import RepositoryFactory from "../../../domain/Interfaces/RepositoryFactoryInterface";
import UserController from "../../controller/UserController";
import Http from "../Http";
import ModelRoutes from "./ModelRoutes";

export default class UserRoutes implements ModelRoutes {

    protected userController: UserController;

    constructor(readonly http: Http, repositoryFactory: RepositoryFactory) {
        this.userController = new UserController(repositoryFactory);
    }

    init(): void {
        this.http.route("post", "/api/auth/register", false, async (params: any, body: any) => {
			return await this.userController.createUser(body);
		});

        this.http.route("post", "/api/auth/login", false, async (params: any, body: any) => {
            return this.userController.login(body);
        });

        this.http.route("get", "/api/user/", true, async () => {
            return this.userController.getAll();
        })

        this.http.route("post", "/api/user/find", true, async (params: any, body: any) => {
            return this.userController.findById(body);
        })
    }
}