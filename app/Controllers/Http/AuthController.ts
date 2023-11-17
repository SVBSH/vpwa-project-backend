import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import ChannelsController from './ChannelsController'

export default class AuthController {
  public async register({ request, auth }: HttpContextContract) {
    const data = await request.validate(UpdateUserValidator)
    const user = await User.create(data)

    return auth.use('api').login(user)
  }

  public async login({ auth, request }: HttpContextContract) {
    const nickname = request.input('nickname')
    const password = request.input('password')

    return auth.use('api').attempt(nickname, password)
  }

  public async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  public async me({ auth, response }: HttpContextContract) {
    // TODO: Add a list of channels the user belongs to

    try {
      if (!auth.user) {
        return response.status(404).json({ message: 'User does not exist.' })
      }

      const userWithChannels =
        await User
          .query()
          .where('id', auth.user.id)
          .preload('channels')
          .first()
      if (!userWithChannels) {
        return response.status(404).json({ message: 'User does not exist.' })
      }
      return {
        user: auth.user?.serialize(),
        channels: userWithChannels.channels,
      }
    } catch (e) {
      return response.status(404)
    }
  }
}
