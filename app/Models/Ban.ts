// Ban model (Ban.ts)

import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'
import { DateTime } from 'luxon'

export default class Ban extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public channelId: number

  @column()
  public bannedById: number

  @column()
  public bannedUserId: number

  @column.dateTime()
  public bannedAt: DateTime

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>

  @belongsTo(() => User, { foreignKey: 'bannedById' })
  public bannedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'bannedUserId' })
  public bannedUser: BelongsTo<typeof User>
}
