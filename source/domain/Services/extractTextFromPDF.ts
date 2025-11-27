import pdf from "pdf-parse";
import { Validators } from "../../shared/validator/Validators";
import { ErrorFactory } from "../../shared/error/ErrorFactory";

export async function extractPdfText(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
        throw ErrorFactory.validationError("Arquivo inválido ou vazio");
    }

    Validators.fileType(file, ["application/pdf"]);
    Validators.fileSize(file, 1_000_000); // 1MB

    try {
        const data = await pdf(file.buffer);
        return data.text;
    } catch (error) {
        throw ErrorFactory.internalError("Erro ao processar o arquivo PDF");
    }
}
