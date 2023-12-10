import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class ChannelUserInvitation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public hostId: number

  @column()
  public guestId: number

  @column()
  public channelId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'hostId',
  })
  public host: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'guestId',
  })
  public guest: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>
}
