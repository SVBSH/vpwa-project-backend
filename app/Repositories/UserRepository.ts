import { Exception, inject } from '@adonisjs/core/build/standalone'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Channel from 'App/Models/Channel'
import User, { UserState } from 'App/Models/User'

@inject(['Services/UserEventRouter'])
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

  public async setUserState(user: User, state: UserState) {
    user.state = state
    await user.save()
    this.UserEventRouter.toUserRooms(user).emit('user_state', { user: user.id, state })
    this.UserEventRouter.toUser(user).emit('user_state', { user: user.id, state })
  }

  constructor(
    private UserEventRouter: UserEventRouterContract
  ) { }
}
