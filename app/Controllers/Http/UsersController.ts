import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import SetStateValidator from 'App/Validators/SetStateValidator'
import UserSettingsValidator from 'App/Validators/UserSettingsValidator'

@inject(['Repositories/UserRepository'])
export default class UsersController {
  public async setState({ auth, request }: HttpContextContract) {
    const { state } = await request.validate(SetStateValidator)
    await this.UserRepository.setUserState(auth.user!, state)
  }

  public async updateSettings({ auth, request }: HttpContextContract) {
    const user = auth.user!
    const updateUser = await request.validate(UserSettingsValidator)

    for (const [key, value] of Object.entries(updateUser)) {
      if (value === '' || value === null) {
        continue
      }

      const original = user[key as keyof typeof user]
      if (original !== value) {
        user[key] = value
      }
    }

    if (updateUser.notifications === 'none') {
      user.pushSubscription = null
    }

    await user.save()
  }

  constructor(
    private UserRepository: UserRepositoryContract
  ) { }
}
