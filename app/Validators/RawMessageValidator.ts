import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { RawMessage } from '@ioc:Repositories/MessageRepository'

const currentSchema = schema.create({
  channel: schema.number([
    rules.exists({ table: 'channels', column: 'id' }),
  ]),
  text: schema.string.optional(),
})

export namespace RawMessageValidator {
  export async function validate(data: any): Promise<RawMessage> {
    const result = await validator.validate({ schema: currentSchema, data })
    // Adonis validators do not allow you to have an empty string value. It is either a string (with value)
    // or optional string (string with value or undefined). When the text is undefined we replace it with
    // an empty string to satisfy the contract.
    result.text ??= ''
    return result as RawMessage
  }
}
