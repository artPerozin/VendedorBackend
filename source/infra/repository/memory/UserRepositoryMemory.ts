import User from "../../../domain/Entity/User";
import UserRepositoryInterface from "../../../domain/Interfaces/UserRepositoryInterface";
import { ErrorFactory } from "../../../shared/error/ErrorFactory";

export default class UserRepositoryMemory implements UserRepositoryInterface {
    private users: User[];

    constructor() {
        this.users = [];
    }
    
    async create(user: User): Promise<User> {
        const exists = this.users.find(existentUser => existentUser.email === user.email);
        if (exists) {
            throw ErrorFactory.alreadyExists("Usuário", "email", user.email);
        }
        this.users.push(user);
        return user;
    }

    async findById(id: string): Promise<User | null> {
        const user = this.users.find(user => user.id === id);
        return user || null;
    }
    
    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find(user => user.email === email);
        return user || null;
    }

    async getAll(): Promise<User[]> {
        return this.users;
    }

    async update(user: User): Promise<User> {
        const index = this.users.findIndex(existingUser => existingUser.id === user.id);
        if (index === -1) {
            throw ErrorFactory.notFound("Usuário", user.id);
        }
        this.users[index] = user;
        return user;
    }
}