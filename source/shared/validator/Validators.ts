import { ErrorFactory } from "../error/ErrorFactory";

export class Validators {
  /**
   * Valida se um valor é obrigatório (não vazio, null ou undefined)
   */
  static required(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === "") {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }
  }

  /**
   * Valida se uma string tem comprimento mínimo
   */
  static minLength(value: string, min: number, fieldName: string): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }
    
    if (value.length < min) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ter no mínimo ${min} caracteres`,
        [{ field: fieldName, value: value.length, constraint: `minLength:${min}` }]
      );
    }
  }

  /**
   * Valida se uma string tem comprimento máximo
   */
  static maxLength(value: string, max: number, fieldName: string): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }
    
    if (value.length > max) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ter no máximo ${max} caracteres`,
        [{ field: fieldName, value: value.length, constraint: `maxLength:${max}` }]
      );
    }
  }

  /**
   * Valida se um número está dentro de um intervalo (min e max inclusivos)
   */
  static range(value: number, min: number, max: number, fieldName: string): void {
    if (value === undefined || value === null) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (value < min || value > max) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve estar entre ${min} e ${max}`,
        [{ field: fieldName, value, constraint: `range:${min}-${max}` }]
      );
    }
  }

  /**
   * Valida se uma string é um email válido
   */
  static email(value: string, fieldName: string = "email"): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um email válido`,
        [{ field: fieldName, value, constraint: "email" }]
      );
    }
  }

  /**
   * Valida se um arquivo tem o tipo MIME correto
   */
  static fileType(file: any, allowedTypes: string[], fieldName: string = "file"): void {
    if (!file) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw ErrorFactory.validationError(
        `Tipo de arquivo inválido. Tipos permitidos: ${allowedTypes.join(", ")}`,
        [{ 
          field: fieldName, 
          value: file.mimetype, 
          constraint: `fileType:${allowedTypes.join(",")}` 
        }]
      );
    }
  }

  /**
   * Valida se um arquivo não excede o tamanho máximo (em bytes)
   */
  static fileSize(file: any, maxSize: number, fieldName: string = "file"): void {
    if (!file) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1_000_000).toFixed(2);
      const currentSizeMB = (file.size / 1_000_000).toFixed(2);
      
      throw ErrorFactory.validationError(
        `O arquivo deve ter no máximo ${maxSizeMB}MB (atual: ${currentSizeMB}MB)`,
        [{ 
          field: fieldName, 
          value: file.size, 
          constraint: `maxSize:${maxSize}` 
        }]
      );
    }
  }

  /**
   * Valida se um valor é um número inteiro
   */
  static integer(value: any, fieldName: string): void {
    if (value === undefined || value === null) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (!Number.isInteger(value)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um número inteiro`,
        [{ field: fieldName, value, constraint: "integer" }]
      );
    }
  }

  /**
   * Valida se um número é positivo (> 0)
   */
  static positive(value: number, fieldName: string): void {
    if (value === undefined || value === null) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (value <= 0) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um número positivo`,
        [{ field: fieldName, value, constraint: "positive" }]
      );
    }
  }

  /**
   * Valida se um número é não-negativo (>= 0)
   */
  static nonNegative(value: number, fieldName: string): void {
    if (value === undefined || value === null) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (value < 0) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' não pode ser negativo`,
        [{ field: fieldName, value, constraint: "nonNegative" }]
      );
    }
  }

  /**
   * Valida se uma string é um UUID válido (v4)
   */
  static uuid(value: string, fieldName: string): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um UUID válido`,
        [{ field: fieldName, value, constraint: "uuid" }]
      );
    }
  }

  /**
   * Valida se uma string é uma URL válida
   */
  static url(value: string, fieldName: string = "url"): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    try {
      new URL(value);
    } catch {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser uma URL válida`,
        [{ field: fieldName, value, constraint: "url" }]
      );
    }
  }

  /**
   * Valida se uma string é uma data válida (ISO 8601)
   */
  static date(value: string, fieldName: string = "date"): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser uma data válida`,
        [{ field: fieldName, value, constraint: "date" }]
      );
    }
  }

  /**
   * Valida se um valor está em uma lista de valores permitidos
   */
  static enum<T>(value: T, allowedValues: T[], fieldName: string): void {
    if (value === undefined || value === null) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (!allowedValues.includes(value)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um dos seguintes valores: ${allowedValues.join(", ")}`,
        [{ 
          field: fieldName, 
          value, 
          constraint: `enum:${allowedValues.join(",")}` 
        }]
      );
    }
  }

  /**
   * Valida se um array não está vazio
   */
  static notEmptyArray(value: any[], fieldName: string): void {
    if (!value || !Array.isArray(value)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (value.length === 0) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' não pode ser um array vazio`,
        [{ field: fieldName, value: [], constraint: "notEmpty" }]
      );
    }
  }

  /**
   * Valida se um valor corresponde a uma regex
   */
  static pattern(value: string, pattern: RegExp, fieldName: string, patternName?: string): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    if (!pattern.test(value)) {
      const message = patternName 
        ? `O campo '${fieldName}' deve corresponder ao padrão ${patternName}`
        : `O campo '${fieldName}' possui formato inválido`;
        
      throw ErrorFactory.validationError(message, [
        { field: fieldName, value, constraint: "pattern" }
      ]);
    }
  }

  /**
   * Valida se um número de telefone brasileiro é válido
   */
  static brazilianPhone(value: string, fieldName: string = "telefone"): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    // Remove caracteres não numéricos
    const cleaned = value.replace(/\D/g, "");
    
    // Valida formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const phoneRegex = /^(\d{2})(\d{4,5})(\d{4})$/;
    
    if (!phoneRegex.test(cleaned)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um telefone brasileiro válido`,
        [{ field: fieldName, value, constraint: "brazilianPhone" }]
      );
    }
  }

  /**
   * Valida se um CPF brasileiro é válido
   */
  static cpf(value: string, fieldName: string = "cpf"): void {
    if (!value) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' é obrigatório`,
        [{ field: fieldName, constraint: "required" }]
      );
    }

    // Remove caracteres não numéricos
    const cleaned = value.replace(/\D/g, "");

    // Valida tamanho
    if (cleaned.length !== 11) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um CPF válido`,
        [{ field: fieldName, value, constraint: "cpf" }]
      );
    }

    // Valida se não são todos dígitos iguais
    if (/^(\d)\1{10}$/.test(cleaned)) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um CPF válido`,
        [{ field: fieldName, value, constraint: "cpf" }]
      );
    }

    // Valida dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um CPF válido`,
        [{ field: fieldName, value, constraint: "cpf" }]
      );
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) {
      throw ErrorFactory.validationError(
        `O campo '${fieldName}' deve ser um CPF válido`,
        [{ field: fieldName, value, constraint: "cpf" }]
      );
    }
  }

  /**
   * Valida múltiplos campos de uma vez
   * Útil para validações mais complexas
   */
  static validateAll(validations: Array<() => void>): void {
    const errors: any[] = [];

    for (const validation of validations) {
      try {
        validation();
      } catch (error: any) {
        if (error.details) {
          errors.push(...error.details);
        }
      }
    }

    if (errors.length > 0) {
      throw ErrorFactory.validationError(
        `Foram encontrados ${errors.length} erro(s) de validação`,
        errors
      );
    }
  }
}