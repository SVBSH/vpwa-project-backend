
declare module '@ioc:Repositories/ChannelRepository' {
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'

  export interface ChannelRepositoryContract {
    getChannelsForUser(user: User): Promise<Channel[]>
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}

declare module '@ioc:Repositories/MessageRepository' {
  import User from 'App/Models/User'

  export interface RawMessage {
    channel: number
    text: string
  }

  export interface ChannelMessage extends RawMessage {
    channel: number
    text: string
    author: number
  }

  export interface MessageRepositoryContract {
    createMessage(user: User, channel: number, text: string): Promise<unknown>
  }

  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}
