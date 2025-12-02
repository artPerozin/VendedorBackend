export default class GetFirstMessagesService {
    private messages: string[];

    constructor() {
        this.messages = [
            `
            Olá, tudo bem? Aqui é a Julia da Evolução Compressores.
            Vi que já conversamos anteriormente e nosso vendedor gostaria de te visitar nos próximos dias.
            
            Gostaríamos de agendar uma visita rápida para falar sobre soluções em ar comprimido — incluindo geração, tratamento, eficiência energética, locações, serviços, planos de manutenção, monitoramento e tubulações.
            Você teria um horário disponível para recebê-lo?
            `
        ];
    }

    async handle(): Promise<string[]> {
        if (this.messages.length === 0) {
            throw new Error("Lista de mensagens iniciais não pode ser vazia");
        }
        return this.messages;
    }
}