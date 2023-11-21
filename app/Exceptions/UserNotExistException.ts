import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserNotExistException extends Exception {
  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(404).send(error.message)
  }
}
