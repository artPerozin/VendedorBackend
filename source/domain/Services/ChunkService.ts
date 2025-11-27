import RepositoryFactoryInterface from "../Interfaces/RepositoryFactoryInterface";
import ChunkRepositoryInterface from "../Interfaces/ChunkRepositoryInterface";
import Chunk from "../Entity/Chunk";
import { cosineSimilarity } from "./CosineSimilarity";

export default class ChunkService {
    private chunkRepository: ChunkRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface) {
        this.chunkRepository = repositoryFactory.createChunkRepository();
    }

    async findRelevantChunks(
        questionEmbedding: number[],
        topK = 3
    ): Promise<Chunk[]> {
        const allChunks: Chunk[] = await this.chunkRepository.getAll();
        if (!allChunks.length) return [];

        const sims = allChunks.map(chunk => {
            let emb: any = chunk.embedding;
            if (typeof emb === "string") {
                try { emb = JSON.parse(emb); } catch { emb = []; }
            }
            const embeddingArray: number[] = Array.isArray(emb) ? (emb as number[]) : [];
            return {
                chunk,
                sim: cosineSimilarity(questionEmbedding, embeddingArray),
            };
        });

        sims.sort((a, b) => b.sim - a.sim);

        return sims.slice(0, topK).map(s => s.chunk);
    }
}
