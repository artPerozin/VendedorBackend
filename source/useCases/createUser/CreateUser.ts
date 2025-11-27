import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { readFileSync } from "fs";
import CreateUserInput from "./CreateUserInput";
import CreateUserOutput from "./CreateUserOutput";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import { Validators } from "../../shared/validator/Validators";
import User from "../../domain/Entity/User";
import { AppError } from "../../shared/error/AppError";
import { ErrorFactory } from "../../shared/error/ErrorFactory";

export default class CreateUser {
    readonly userRepository: UserRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.userRepository = repositoryFactory.createUserRepository();
    }

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        Validators.required(input.email, "email");
        Validators.email(input.email);
        Validators.required(input.password, "password");
        Validators.minLength(input.password, 6, "password");

        try {
            const encryptPassword = await hash(input.password, 10);
            const user = new User(input.email, encryptPassword);
            await this.userRepository.create(user);
            const privateKey = readFileSync('./private.key');
            const payload = {
                userId: user.id,
                userEmail: user.email
            };
            const accessToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "24h"
            });
            return { accessToken };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.internalError("Erro ao criar usuário");
        }
    }
}
