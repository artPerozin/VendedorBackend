import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import CreateUser from "../../useCases/createUser/CreateUser";
import CreateUserInput from "../../useCases/createUser/CreateUserInput";
import CreateUserOutput from "../../useCases/createUser/CreateUserOutput";
import FindUserById from "../../useCases/findUserById/FindUserById";
import FindUserByIdInput from "../../useCases/findUserById/FindUserByIdInput";
import FindUserByIdOutput from "../../useCases/findUserById/FindUserByIdOutput";
import GetAllUsers from "../../useCases/getAllUsers/GetAllUsers";
import GetAllUsersOutput from "../../useCases/getAllUsers/GetAllUsersOutput";
import LoginUser from "../../useCases/loginUser/LoginUser";
import LoginUserInput from "../../useCases/loginUser/LoginUserInput";

export default class UserController {

    constructor(protected repositoryFactory: RepositoryFactoryInterface) {
    }

    async createUser(input: CreateUserInput): Promise<CreateUserOutput> {
        const createUser = new CreateUser(this.repositoryFactory);
        return await createUser.execute(input);
    }

    async login(input: LoginUserInput): Promise<{ accessToken: string }> {
        const loginUser = new LoginUser(this.repositoryFactory);
        return await loginUser.execute(input);
    }

    async getAll(): Promise<GetAllUsersOutput> {
        const getAllUsers = new GetAllUsers(this.repositoryFactory);
        return await getAllUsers.execute();
    }

    async findById(input: FindUserByIdInput): Promise<FindUserByIdOutput> {
        const findById = new FindUserById(this.repositoryFactory);
        return await findById.execute(input);
    }
}