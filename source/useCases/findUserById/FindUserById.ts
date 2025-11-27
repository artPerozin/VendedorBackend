import User from "../../domain/Entity/User";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { Validators } from "../../shared/validator/Validators";
import FindUserByIdInput from "./FindUserByIdInput";
import FindUserByIdOutput from "./FindUserByIdOutput";

export default class FindUserById {
    readonly userRepository: UserRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.userRepository = repositoryFactory.createUserRepository();
    }

    async execute(input: FindUserByIdInput): Promise<FindUserByIdOutput> {
        Validators.required(input.userId, "userId");
        Validators.uuid(input.userId, "userId");

        const response = await this.userRepository.findById(input.userId);
        
        if (!response) {
            throw ErrorFactory.notFound("Usuário", input.userId);
        }

        return {
            user: new User(response.email, response.password, response.id)
        };
    }
}