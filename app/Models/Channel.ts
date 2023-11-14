import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany, HasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Message from './Message'
import User from './User'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column({ serializeAs: 'admin' })
  public channelAdmin: number

  @column({ serializeAs: null })
  public isPublic: boolean

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @hasOne(() => User, {
    foreignKey: 'channelAdmin',
  })
  public admin: HasOne<typeof User>

  @computed()
  public get type() {
    return this.isPublic === true ? 'public' : 'private'
  }
}
