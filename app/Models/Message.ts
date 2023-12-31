import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'author' })
  public createdBy: number

  @column({ serializeAs: null })
  public channelId: number

  @column()
  public content: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
    serializeAs: 'user',
  })
  public author: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>
}
