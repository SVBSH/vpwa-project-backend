
declare module '@ioc:Repositories/ChannelRepository' {
  import Ban from 'App/Models/Ban'
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'
  export interface ChannelRepositoryContract {
    getChannelsForUser(user: User): Promise<Channel[]>
    getBannedUsers(channel: Channel): Promise<Ban[]>
    removeUser(channel: Channel, user: User): void
    addUser(channel: Channel, user: User): Promise<void>
    getChannel(identifier: string | number): Promise<Channel>
    getMessagesForChannel(channel: Channel): void
    createChannel(adminId: number, channelName: string, isPublic?: boolean): Promise<Channel>
    deleteChannel(channel: Channel): Promise<void>
    hasMember(channel: Channel, userId: number): Promise<boolean>
    isAdmin(channel: Channel, userId: number): Promise<boolean>
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}

declare module '@ioc:Repositories/UserRepository' {
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'

  export interface UserRepositoryContract {
    getUser(identifier: string | number): Promise<User>
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
    id: number
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

declare module '@ioc:Repositories/BanRepository' {
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'

  export interface BanRepositoryContract {
    banUser(channel: Channel, banInitiator: number, targetUser: User): void
    getBanCount(user: User, channelId: number): Promise<number>
    isBanned(user: User, channel: Channel): Promise<boolean>
  }
  const BanRepository: BanRepositoryContract
  export default BanRepository
}
