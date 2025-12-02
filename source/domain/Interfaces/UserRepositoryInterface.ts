import User from "../Entity/User";

export default interface UserRepositoryInterface {
    create(user: User): Promise<User | null>;
    getAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(user: User): Promise<User>;
}