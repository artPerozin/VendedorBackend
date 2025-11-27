export default interface AskQuestionInput {
    question: string;
    mentorType: "GENERATIVO" | "REFLEXIVO";
    userId: string;
    conversationId: string;
    file?: Express.Multer.File;
}
