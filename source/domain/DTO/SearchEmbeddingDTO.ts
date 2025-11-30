export default interface SearchEmbeddingDTO {
    embedding: number[];
    limit: number;
    similarityThreshold: number;
}