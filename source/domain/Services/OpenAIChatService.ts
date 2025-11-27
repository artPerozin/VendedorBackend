import OpenAI from "openai";
import { ModelType } from "../Enums/ModelType";
import { TokenType } from "../Enums/TokenType";
import RepositoryFactoryInterface from "../Interfaces/RepositoryFactoryInterface";
import TokenRepositoryInterface from "../Interfaces/TokenRepositoryInterface";
import Token from "../Entity/Token";
import Conversation from "../Entity/Conversation";
import Message from "../Entity/Message";
import { ChatCompletionMessageParam } from "openai/resources/index";
import ConversationRepositoryInterface from "../Interfaces/ConversationRepositoryInterface";
import systemPrompts from "../Enums/SystemPrompts";

export default class OpenAIChatService {
    private openai: OpenAI;
    private tokenRepository: TokenRepositoryInterface;
    private conversationRepository: ConversationRepositoryInterface;

    constructor(repositoryFactory: RepositoryFactoryInterface, openai?: OpenAI) {
        this.openai = openai || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.tokenRepository = repositoryFactory.createTokenRepository();
        this.conversationRepository = repositoryFactory.createConversationRepository();
    }

    async chatWithConversation(
        conversation: Conversation,
        model: ModelType,
        userPrompt: string,
        mentorType: 'GENERATIVO' | 'REFLEXIVO',
        contextIds: string[] = []
    ): Promise<{ answer: string; messageId: string }> {

        const previousMessages = await this.conversationRepository.getMessages(conversation.id);

        const formattedMessages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: systemPrompts[mentorType],
            },
            ...previousMessages.map(m => ({
                role: m.role,
                content: m.content
            })),
            {
                role: "user",
                content: userPrompt,
            },
        ];

        const response = await this.openai.chat.completions.create({
            model,
            messages: formattedMessages,
        });

        const reply = response.choices[0].message?.content || "";
        const nextOrderIndex = previousMessages.length;

        const userMessage = new Message({
            chatId: conversation.id,
            role: "user",
            content: userPrompt,
            orderIndex: nextOrderIndex,
            contextIds,
            metadata: {
                source: "human"
            }
        });

        await this.conversationRepository.addMessage(conversation.id, userMessage);

        const assistantMessage = new Message({
            chatId: conversation.id,
            role: "assistant",
            content: reply,
            orderIndex: nextOrderIndex + 1,
            contextIds,
            metadata: {
                model,
                tokens: response.usage,
            }
        });

        await this.conversationRepository.addMessage(conversation.id, assistantMessage);

        const tokensUsed = response.usage?.total_tokens || 0;
        const token = new Token(model, TokenType.OUTPUT, tokensUsed);

        await this.tokenRepository.create(token);

        return {
            answer: reply,
            messageId: assistantMessage.id
        };
    }
}
