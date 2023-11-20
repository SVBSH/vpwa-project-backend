import { Exception } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async getChannelsForUser(user: User) {
    await user.load('channels')
    return user.channels
  }

  public async getMessagesForChannel(channel: Channel) {
    await channel.load('messages', (messagesQuery) => {
      messagesQuery.preload('author').orderBy('id', 'desc')
    })

    return channel.messages
  }

  public async getBannedUsers(channel: Channel) {
    //TODO:
    await channel.load('bans')
    return channel.bans
  }

  public async getChannel(identifier: string | number) {
    try {
      let searchField = ''
      if (typeof identifier === 'string') {
        searchField = 'name'
        // validate other types
      } else {
        searchField = 'id'
      }
      return await Channel
        .query()
        .where(searchField, identifier)
        .firstOrFail()
    } catch (error) {
      throw new Exception('Requested channel does not exist.', 404)
    }
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

  public async removeUser(channel: Channel, userId: number) {
    await channel.related('users').detach([userId])
  }

  public async hasMember(channel: Channel, userId: number) {
    const user = await channel
      .related('users')
      .pivotQuery()
      .where('user_id', userId)
      .first()
    return user !== null
  }

  public hasMemberBanned(channel: Channel, memberId: number) {
    // const guestBannedListQuery = channel
    //   .related('bannedMembers')
    //   .pivotQuery()
    //   // .where('channel_id', reqChannel.id)
    //   .andWhere('banned_user_id', memberId)

    // const guestBannedCount = await guestBannedListQuery
    //   .count('* as total')
    //   .first()
    // if (guestBannedCount.total > 1) {
  }

  public async isAdmin(channel: Channel, userId: number) {
    await channel.load('admin')
    return channel.admin.id === userId
  }

  public getAdmin(channel: Channel) {
    return channel.related('admin')
  }
}
