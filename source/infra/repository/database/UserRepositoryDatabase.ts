import User from "../../../domain/Entity/User";
import UserRepositoryInterface from "../../../domain/Interfaces/UserRepositoryInterface";
import { AppError } from "../../../shared/error/AppError";
import { ErrorCode } from "../../../shared/error/ErrorCode";
import { ErrorFactory } from "../../../shared/error/ErrorFactory";
import Connection from "../../database/Connection";

export default class UserRepositoryDatabase implements UserRepositoryInterface {
    constructor(protected connection: Connection) {}

    async create(user: User): Promise<User | null> {
        try {
            const exists = await this.findByEmail(user.email);
            if (exists) {
                throw ErrorFactory.alreadyExists("Usuário", "email", user.email);
            }

            await this.connection.execute(
                "insert into users (id, email, password) values ($1, $2, $3);",
                [user.id, user.email, user.password]
            );

            return await this.findById(user.id);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            if (error.code === '23505') {
                throw ErrorFactory.alreadyExists("Usuário", "email", user.email);
            }
            throw new AppError(
                "Erro ao criar usuário no banco de dados",
                ErrorCode.DATABASE_ERROR,
                500
            );
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            const result = await this.connection.execute(
                "select id, email, password from users where id = $1",
                [id]
            );

            if (result.length === 0) return null;

            return new User(result[0].email, result[0].password, result[0].id);
        } catch (error) {
            throw ErrorFactory.databaseError("Erro ao buscar usuário por ID");
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.connection.execute(
                "select id, email, password from users where email = $1",
                [email]
            );

            if (result.length === 0) return null;

            return new User(result[0].email, result[0].password, result[0].id);
        } catch (error) {
            throw ErrorFactory.databaseError("Erro ao buscar usuário por email");
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const result = await this.connection.execute(
                "select id, email, password from users"
            );
            return result.map((user: any) => 
                new User(user.email, user.password, user.id)
            );
        } catch (error) {
            throw ErrorFactory.databaseError("Erro ao listar usuários");
        }
    }

    async update(user: User): Promise<User> {
        try {
            const exists = await this.findById(user.id);
            if (!exists) {
                throw ErrorFactory.notFound("Usuário", user.id);
            }

            await this.connection.execute(
                "update users set email = $1, password = $2 where id = $3",
                [user.email, user.password, user.id]
            );

            return user;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw ErrorFactory.databaseError("Erro ao atualizar usuário");
        }
    }
}