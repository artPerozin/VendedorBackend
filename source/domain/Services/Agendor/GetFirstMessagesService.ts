export class GetFirstMessagesService {
    private messages: string[];

    constructor() {
        this.messages = [
            "Olá! Tudo bem? Vi o trabalho da sua empresa e achei bem interessante. Podemos conversar um pouco sobre como podemos gerar mais resultados juntos?",
            "Oi! Tudo bem? Sou da Evolução Compressores e acredito que podemos gerar melhores resultados para vocês. Podemos fazer uma conversa rápida?",
            "Bom dia! Estou entrando em contato pois vi que vocês estão em crescimento e talvez possamos apoiar. Faz sentido conversarmos?",
        ];
    }

    handle(): string[] {
        if (this.messages.length === 0) {
            throw new Error("Lista de mensagens iniciais não pode ser vazia");
        }
        return this.messages;
    }
}