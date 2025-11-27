import Token from "../../../domain/Entity/Token";
import TokenRepositoryInterface from "../../../domain/Interfaces/TokenRepositoryInterface";
import Connection from "../../database/Connection";

export default class TokenRepositoryDatabase implements TokenRepositoryInterface{

    constructor(protected connection: Connection) {
    }

    async create(token: Token): Promise<Token | null> {
        await this.connection.execute("insert into tokens (id, model, type, amount, created_at) values ($1, $2, $3, $4, $5);", [token.id, token.model, token.type, token.amount, token.createdAt]);
        return token;
    }

    async getAll(): Promise<Token[]> {
        return await this.connection.execute("select * from tokens order by created_at")
    }
}