import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class JoinChannelValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    channelName: schema.string(
      { trim: true },
      [
        rules.minLength(1),
        rules.maxLength(50),
      ]),
    isPublic: schema.boolean.optional(),
  })

  public messages: CustomMessages = {
    'channelName.required': 'The channel name is required.',
    'channelName.minLength': 'The channel name must be at least 1 character long.',
    'channelName.maxLength': 'The channel name must not exceed 50 characters.',
    'channelType.enum': 'The channel type must be either public or private.',
  }
}
