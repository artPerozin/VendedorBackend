import Message from "../../domain/Entity/Message"

export default interface GetMessagesFromConversationOutput {
    data: Message[]
}