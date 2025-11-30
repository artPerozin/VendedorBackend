import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import Http from "./Http";
import ContactRoutes from "./Routes/ContactRoutes";
export default class Router {

	protected contactRoutes: ContactRoutes;

	constructor(readonly http: Http, readonly repositoryFactory: RepositoryFactoryInterface) {
		this.contactRoutes = new ContactRoutes(this.http, this.repositoryFactory);
	}

	init() {
		this.http.route("get", "/api/", false, async () => {
			return {
				message: "welcome"
			}
		});
		this.contactRoutes.init();
	}
}