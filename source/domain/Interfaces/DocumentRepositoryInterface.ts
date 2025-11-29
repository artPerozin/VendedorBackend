import Document from "../Entity/Document";

export default interface DocumentRepositoryInterface {
    create(document: Document): Promise<void>;
    createMany(documents: Document[]): Promise<void>
}