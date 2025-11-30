import SearchEmbeddingDTO from "../../DTO/SearchEmbeddingDTO";
import ChunkRepositoryInterface from "../../Interfaces/ChunkRepositoryInterface";
import RepositoryFactoryInterface from "../../Interfaces/RepositoryFactoryInterface";

export default class SearchSimilarChunks {
    private chunkRepository: ChunkRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface){
        this.chunkRepository = repositoryFactory.createChunkRepository();
    }

    async handle(
        queryVector: number[],
        limit: number = 5,
        similarityThreshold: number = 0.7
    ): Promise<string[]> {

        const dto: SearchEmbeddingDTO = {
            embedding: queryVector,
            limit,
            similarityThreshold,
        };

        try {
            const results = await this.chunkRepository.searchByEmbedding(dto);
            return results.map(r => r.content);
        } catch (error) {
            console.error("Erro na busca vetorial via repository:", error);
            return [];
        }
    }
}
