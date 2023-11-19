import { Exception } from '@adonisjs/core/build/standalone'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserRepository implements UserRepositoryContract {
  public async getUsersForChannel(channel: Channel) {
    await channel.load('users')
    return channel.users
  }

  public async getUser(identifier: string | number): Promise<User> {
    try {
      let searchField = ''
      if (typeof identifier === 'string') {
        searchField = 'nickname'
      } else if (typeof identifier === 'number') {
        searchField = 'id'
      }
      return await User
        .query()
        .where(searchField, identifier)
        .firstOrFail()
    } catch (error) {
      throw new Exception('This user is not a member of this channel.', 404)
    }
  }
}
