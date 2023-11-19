
declare module '@ioc:Repositories/ChannelRepository' {
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'

  export interface ChannelRepositoryContract {
    getChannelsForUser(user: User): Promise<Channel[]>
    getBannedUsers(channel: Channel): Promise<User[]>
    addUser(channel: Channel, userId: number): Promise<void>
    getChannel(identifier: string | number): Promise<Channel | null>
    getMessagesForChannel(channel: Channel)
    createChannel(adminId: number, channelName: string, isPublic?: boolean): Promise<Channel>
    hasMember(channel: Channel, userId: number): Promise<boolean>
    isAdmin(channel: Channel, userId: number): boolean
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}

declare module '@ioc:Repositories/UserRepository' {
  import User from 'App/Models/User'
  import Channel from 'App/Models/Channel'

  export interface UserRepositoryContract {
    getUser(identifier: string | number): Promise<User | null>
    getUsersForChannel(channel: Channel): Promise<User[]>
  }

  const UserRepository: UserRepositoryContract
  export default UserRepository
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
