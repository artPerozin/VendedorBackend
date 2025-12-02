import AskQuestionInput from "../../../useCases/askQuestion/AskQuestionInput";

interface WebhookPayload {
  local: string;
  url: string;
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
      senderLid?: string | null;
      senderPn: string;
      participant?: string | null;
      participantLid?: string | null;
    };
    pushName: string;
    status: string;
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      imageMessage?: {
        caption?: string;
      };
      videoMessage?: {
        caption?: string;
      };
      documentMessage?: {
        caption?: string;
      };
      [key: string]: any;
    };
    contextInfo?: any | null;
    messageType: string;
    messageTimestamp: number;
    instanceId: string;
    source: string;
  };
  destination: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
}

export class WebhookTransformerMiddleware {
  /**
   * Transforma o payload do webhook em AskQuestionInput
   */
  static transform(payload: WebhookPayload): AskQuestionInput {
    const question = this.extractMessage(payload.data.message);

    const phoneNumberField = payload.data.key.senderPn ?? payload.data.key.remoteJid

    const phoneNumber = this.extractPhoneNumber(phoneNumberField);
    const pushName = payload.data.pushName || 'Usuário';

    return {
      question,
      phoneNumber,
      pushName,
      
    };
  }

  /**
   * Extrai o número de telefone removendo o sufixo do WhatsApp
   */
  private static extractPhoneNumber(identifier: string): string {
    return identifier
      .replace("@s.whatsapp.net", "")
      .replace("@lid", "")
      .replace("@g.us", "")
      .trim();
  }

  private static extractMessage(message: WebhookPayload["data"]["message"]): string {
    if (message.conversation) return message.conversation;

    if (message.extendedTextMessage?.text)
      return message.extendedTextMessage.text;

    if (message.imageMessage?.caption)
      return message.imageMessage.caption;

    if (message.videoMessage?.caption)
      return message.videoMessage.caption;

    if (message.documentMessage?.caption)
      return message.documentMessage.caption;

    return "";
  }

  static validate(payload: WebhookPayload): void {
    if (!payload.data?.key) {
      throw new Error("Campo key é obrigatório");
    }

    // Agora o número pode vir em senderPn OU remoteJid
    if (!payload.data.key.remoteJid && !payload.data.key.senderPn) {
      throw new Error("Nenhum identificador remoto encontrado");
    }

    if (!payload.data?.message) {
      throw new Error("Campo message é obrigatório");
    }

    if (!payload.data.pushName) {
      throw new Error("Campo pushName é obrigatório");
    }

    const message = this.extractMessage(payload.data.message);
    if (!message.trim()) {
      throw new Error("Mensagem vazia não pode ser processada");
    }
  }
  
  /**
   * Verifica se a mensagem é válida para processamento
   */
  static shouldProcess(payload: WebhookPayload): boolean {
    // Verifica se o evento é messages.upsert
    if (payload.event !== 'messages.upsert') {
      console.log(`Evento ${payload.event} ignorado`);
      return false;
    }

    // Ignora mensagens enviadas pelo próprio bot
    if (payload.data.key.fromMe) {
      console.log('Mensagem enviada pelo bot ignorada');
      return false;
    }

    // Verifica se é um grupo (contém @g.us)
    if (payload.data.key.remoteJid.includes('@g.us')) {
      console.log('Mensagem de grupo ignorada');
      return false;
    }

    // Ignora mensagens sem texto
    const message = this.extractMessage(payload.data.message);
    if (!message || message.trim() === '') {
      console.log('Mensagem vazia ignorada');
      return false;
    }

    return true;
  }

  /**
   * Verifica se o payload tem a estrutura esperada
   */
  static isValidStructure(payload: any): payload is WebhookPayload {
    return (
      payload &&
      typeof payload === 'object' &&
      payload.data &&
      payload.data.key &&
      payload.data.message
    );
  }
}

/**
 * Middleware principal que processa o webhook
 */
export function webhookMiddleware(payload: any): AskQuestionInput | null {
  try {
    if (!WebhookTransformerMiddleware.isValidStructure(payload)) {
      console.error('Payload com estrutura inválida');
      return null;
    }

    if (!WebhookTransformerMiddleware.shouldProcess(payload)) {
      return null;
    }

    WebhookTransformerMiddleware.validate(payload);

    const input = WebhookTransformerMiddleware.transform(payload);
    
    console.log('✅ Mensagem transformada:', {
      phoneNumber: input.phoneNumber,
      pushName: input.pushName,
      question: input.question.substring(0, 50) + '...'
    });
    
    return input;

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Aplicação do middleware na rota
 */
export function applyWebhookRoute(http: any, conversationController: any): void {
  http.route("post", "/api/conversation/messages-upsert", true, async (params: any, body: any) => {
    try {
      const input = webhookMiddleware(body);
      
      if (!input) {
        return { 
          success: true, 
          message: 'Mensagem ignorada ou inválida' 
        };
      }
      
      const result = await conversationController.askQuestion(input);
      
      return { 
        success: true, 
        data: result 
      };
      
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  });
}