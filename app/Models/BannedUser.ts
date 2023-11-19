import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class BannedUser extends BaseModel {
  public static table = 'banned_users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public bannedUserId: number

  @column()
  public channelId: number

  @column()
  public bannedById: number

  @column.dateTime({ autoCreate: true })
  public bannedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'bannedUserId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>

  @belongsTo(() => User, {
    foreignKey: 'bannedById',
  })
  public banner: BelongsTo<typeof User>
}
