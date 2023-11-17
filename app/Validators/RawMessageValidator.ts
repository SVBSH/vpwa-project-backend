import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { RawMessage } from '@ioc:Repositories/MessageRepository'

const currentSchema = schema.create({
  channel: schema.number([
    rules.exists({ table: 'channels', column: 'id' }),
  ]),
  text: schema.string(),
})

export namespace RawMessageValidator {
  export async function validate(data: any): Promise<RawMessage> {
    return await validator.validate({ schema: currentSchema, data })
  }
}
