import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async getChannelsForUser(user: User) {
    await user.load('channels')
    return user.channels
  }

  public async getMessagesForChannel(channel: Channel) {
    const messages = await channel.load('messages', (messagesQuery) => {
      messagesQuery.orderBy('id', 'desc')
        .limit(2)
    })
    return messages
  }

  public async getBannedUsers(channel: Channel) {
    await channel.load('bannedMembers')
    return channel.bannedMembers
  }

  public async getChannel(identifier: string | number) {
    let searchField = ''
    if (typeof identifier === 'string') {
      searchField = 'name'
    } else if (typeof identifier === 'number') {
      searchField = 'id'
    } else {
      return null
    }
    return await Channel
      .query()
      .where(searchField, identifier)
      .first()
  }

  public async createChannel(
    adminId: number, channelName: string, isPublic?: boolean) {
    return await Channel.create({
      channelAdmin: adminId,
      isPublic: !!isPublic,
      name: channelName,
    })
  }

  public async addUser(channel: Channel, userId: number) {
    return await channel.related('users').attach([userId])
  }

  public async hasMember(channel: Channel, userId: number) {
    return !!(await channel
      .related('users')
      .pivotQuery()
      .where('id', userId)
      .first())
  }

  public isAdmin(channel: Channel, userId: number) {
    return channel.admin.id === userId
  }
}
