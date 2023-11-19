import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import User from 'App/Models/User'

export default class UserRepository implements UserRepositoryContract {
  public async getUser(identifier: string | number): Promise<User | null> {
    let searchField = ''
    if (typeof identifier === 'string') {
      searchField = 'nickname'
    } else if (typeof identifier === 'number') {
      searchField = 'id'
    } else {
      return null
    }
    return await User
      .query()
      .where(searchField, identifier)
      .first()
  }
}
