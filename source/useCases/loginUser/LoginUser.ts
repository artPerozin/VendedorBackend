import { compare } from "bcrypt";
import { readFileSync } from "fs";
import { sign } from "jsonwebtoken";
import UserRepositoryInterface from "../../domain/Interfaces/UserRepositoryInterface";
import RepositoryFactoryInterface from "../../domain/Interfaces/RepositoryFactoryInterface";
import LoginUserInput from "./LoginUserInput";
import LoginUserOutput from "./LoginUserOutput";
import { Validators } from "../../shared/validator/Validators";
import { ErrorFactory } from "../../shared/error/ErrorFactory";
import { AppError } from "../../shared/error/AppError";

export default class LoginUser {
    readonly userRepository: UserRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.userRepository = repositoryFactory.createUserRepository();
    }

    async execute(input: LoginUserInput): Promise<LoginUserOutput> {
        Validators.required(input.email, "email");
        Validators.email(input.email);
        Validators.required(input.password, "password");

        try {
            const user = await this.userRepository.findByEmail(input.email);
            
            if (!user) {
                throw ErrorFactory.unauthorized("Credenciais inválidas");
            }

            const isEqual = await compare(input.password, user.password);
            
            if (!isEqual) {
                throw ErrorFactory.unauthorized("Credenciais inválidas");
            }

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
            throw ErrorFactory.internalError("Erro ao realizar login");
        }
    }
}
