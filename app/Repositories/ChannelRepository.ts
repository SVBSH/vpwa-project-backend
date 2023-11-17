import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async getChannelsForUser(user: User) {
    await user.load('channels')
    return user.channels
  }
}
