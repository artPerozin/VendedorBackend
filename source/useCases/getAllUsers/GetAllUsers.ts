import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import { AppError } from "../../shared/error/AppError";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import GetAllUsersOutput from "./GetAllUsersOutput";

export default class GetAllUsers {
    readonly userRepository: UserRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.userRepository = repositoryFactory.createUserRepository();
    }

    async execute(): Promise<GetAllUsersOutput> {
        try {
            const response = await this.userRepository.getAll();
            
            return { data: response };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.databaseError("Erro ao buscar usuários");
        }
    }
}