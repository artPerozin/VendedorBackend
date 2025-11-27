import Token from "../../../domain/Entity/Token";
import TokenRepositoryInterface from "../../../domain/Interfaces/TokenRepositoryInterface";

export default class TokenRepositoryMemory implements TokenRepositoryInterface {

    private tokens: Token[];

    constructor() {
        this.tokens = [];
    }
    
    async create(token: Token): Promise<Token | null> {
        this.tokens.push(token);
        return token;
    }

    async getAll(): Promise<Token[]> {
        return this.tokens;
    }
}