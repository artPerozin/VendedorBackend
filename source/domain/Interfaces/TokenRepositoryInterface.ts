import Token from "../Entity/Token";

export default interface TokenRepositoryInterface {
    create(token: Token): Promise<Token | null>;
    getAll(): Promise<Token[]>;
}