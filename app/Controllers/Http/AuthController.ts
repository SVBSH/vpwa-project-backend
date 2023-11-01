import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

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

  public async me({ auth }: HttpContextContract) {
    // TODO: Add a list of channels the user belongs to
    return {
      user: auth.user?.serialize(),
      channels: [],
    }
  }
}
