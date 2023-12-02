import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CustomMessages, schema } from '@ioc:Adonis/Core/Validator'

export default class PushSubscriptionValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    endpoint: schema.string(),
    keys: schema.object().members({
      p256dh: schema.string(),
      auth: schema.string(),
    }),
  })

  public messages: CustomMessages = {}
}
