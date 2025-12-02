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
      senderPn?: string | null;
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
    const phoneNumber = this.extractPhoneNumber(payload.data.key.remoteJid);
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
  private static extractPhoneNumber(remoteJid: string): string {
    return remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
  }

  /**
   * Extrai o texto da mensagem considerando diferentes tipos
   */
  private static extractMessage(message: WebhookPayload['data']['message']): string {
    // Mensagem de texto simples
    if (message.conversation) {
      return message.conversation;
    }
    
    // Mensagem de texto estendida (com formatação, reply, etc)
    if (message.extendedTextMessage?.text) {
      return message.extendedTextMessage.text;
    }
    
    // Legenda de imagem
    if (message.imageMessage?.caption) {
      return message.imageMessage.caption;
    }
    
    // Legenda de vídeo
    if (message.videoMessage?.caption) {
      return message.videoMessage.caption;
    }
    
    // Legenda de documento
    if (message.documentMessage?.caption) {
      return message.documentMessage.caption;
    }
    
    return '';
  }

  /**
   * Valida se o payload possui os campos obrigatórios
   */
  static validate(payload: WebhookPayload): void {
    if (!payload.data?.key?.remoteJid) {
      throw new Error('Campo remoteJid é obrigatório');
    }

    if (!payload.data?.message) {
      throw new Error('Campo message é obrigatório');
    }

    if (!payload.data?.pushName) {
      throw new Error('Campo pushName é obrigatório');
    }

    const message = this.extractMessage(payload.data.message);
    if (!message || message.trim() === '') {
      throw new Error('Mensagem vazia não pode ser processada');
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
    // if (payload.data.key.fromMe) {
    //   console.log('Mensagem enviada pelo bot ignorada');
    //   return false;
    // }

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
    // Verifica estrutura básica
    if (!WebhookTransformerMiddleware.isValidStructure(payload)) {
      console.error('Payload com estrutura inválida');
      return null;
    }

    // Verifica se deve processar a mensagem
    if (!WebhookTransformerMiddleware.shouldProcess(payload)) {
      return null;
    }

    // Valida campos obrigatórios
    WebhookTransformerMiddleware.validate(payload);

    // Transforma o payload
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
      // Aplica o middleware para transformar o payload do webhook
      const input = webhookMiddleware(body);
      
      // Se a mensagem não deve ser processada, retorna sucesso
      if (!input) {
        return { 
          success: true, 
          message: 'Mensagem ignorada ou inválida' 
        };
      }
      
      // Passa o input transformado para o controller
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