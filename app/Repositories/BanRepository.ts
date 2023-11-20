import { Exception, inject } from '@adonisjs/core/build/standalone'
import { BanRepositoryContract } from '@ioc:Repositories/BanRepository'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import Ban from 'App/Models/Ban'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

@inject(['Repositories/ChannelRepository'])
export default class BanRepository implements BanRepositoryContract {
  constructor(
    private ChannelRepository: ChannelRepositoryContract
  ) { }

  public async getBanCount(user: User, channelId: number) {
    const banCount = await Ban.query()
      .where('channelId', channelId)
      .andWhere('bannedUserId', user.id)
    return banCount.length
  }

  public async isBanned(user: User, channel: Channel) {
    const bans = await Ban
      .query()
      .where('channelId', channel.id)
      .andWhere('bannedUserId', user.id)
    const banCount = bans.length

    if (banCount > 2) {
      return true
    }

    const bannedByAdmin = bans.some(ban => {
      // @ts-ignore
      return (ban.bannedById === parseInt(channel.channelAdmin)) && (ban.channelId === channel.id)
    })

    return bannedByAdmin
  }

  public async banUser(channel: Channel, banInitiatorId: number, targetUser: User) {
    try {
      if (banInitiatorId === targetUser.id) {
        throw new Exception('You are not allowed to ban yourself.', 403)
      }

      const alreadyBannedFromUser = await Ban
        .query()
        .where('bannedUserId', targetUser.id)
        .andWhere('channelId', channel.id)
        .andWhere('bannedById', banInitiatorId)
        .first()
      if (alreadyBannedFromUser) {
        throw new Exception(`You had already banned "${targetUser.nickname}"`, 403)
      }

      const banUserIsAdmin = await this.ChannelRepository.isAdmin(channel, targetUser.id)
      if (banUserIsAdmin) {
        throw new Exception('Admin of the channel can not be banned.', 403)
      }

      await Ban.create({
        channelId: channel.id,
        bannedById: banInitiatorId,
        bannedUserId: targetUser.id,
      })
    } catch (error) {
      throw error
    }
  }

  public async removeBan(channel: Channel, userId: number) {
    await Ban.query()
      .where('channelId', channel.id)
      .andWhere('bannedUserId', userId)
      .delete()
  }
}
