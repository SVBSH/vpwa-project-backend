import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import SetStateValidator from 'App/Validators/SetStateValidator'

@inject(['Repositories/UserRepository'])
export default class UsersController {
  public async setState({ auth, request }: HttpContextContract) {
    const { state } = await request.validate(SetStateValidator)
    await this.UserRepository.setUserState(auth.user!, state)
  }

  constructor(
    private UserRepository: UserRepositoryContract
  ) { }
}
