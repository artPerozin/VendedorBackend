import { ModelType } from "../Enums/ModelType";
import { TokenType } from "../Enums/TokenType";
import { OpenAI } from "openai";
import RepositoryFactoryInterface from "../Interfaces/RepositoryFactoryInterface";
import TokenRepositoryInterface from "../Interfaces/TokenRepositoryInterface";
import Token from "../Entity/Token";

export default class EmbeddingService {
    readonly tokenRepository: TokenRepositoryInterface;
    private openai: OpenAI;

    constructor(repositoryFactory: RepositoryFactoryInterface, openai: OpenAI) {
        this.tokenRepository = repositoryFactory.createTokenRepository();
        this.openai = openai
    }

    async createEmbedding(text: string, model: ModelType, tokenType: TokenType): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model,
            input: text
        });
        const tokensUsed = response.usage?.total_tokens || text.length; 
        const token = new Token(model, tokenType, tokensUsed);
        await this.tokenRepository.create(token);
        return response.data[0].embedding;
    }
}
