import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  hasMany,
  HasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
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

  @belongsTo(() => User, {
    foreignKey: 'channelAdmin',
  })
  public admin: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'channel_users',
  })
  public users: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'channel_users_bans',
  })
  public bannedMembers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'channel_user_invintations',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'host_id',
    pivotTimestamps: false,
  })
  public invitedMembers: ManyToMany<typeof User>

  @computed()
  public get type() {
    return this.isPublic === true ? 'public' : 'private'
  }
}
