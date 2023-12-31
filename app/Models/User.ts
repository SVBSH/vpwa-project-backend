import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, ManyToMany, beforeSave, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Channel from './Channel'

export type UserState = (typeof USER_STATE)[number]
export const USER_STATE = ['online', 'offline', 'dnd'] as const
export type UserNotifySettings = (typeof USER_NOTIFY_SETTINGS)[number]
export const USER_NOTIFY_SETTINGS = ['all', 'mentioned', 'none'] as const

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nickname: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public name: string

  @column()
  public surname: string

  @column()
  public email: string

  @column()
  public state: UserState

  @column()
  public notifications: UserNotifySettings

  @column({ serializeAs: null })
  public rememberMeToken: string | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @column({ serializeAs: 'pushSubscription' })
  public pushSubscription: string | null

  @manyToMany(() => Channel, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id',
    pivotTimestamps: false,
  })
  public channels: ManyToMany<typeof Channel>

  @manyToMany(() => Channel, {
    pivotTable: 'channel_users_bans',
    pivotForeignKey: 'banned_user_id',
    pivotRelatedForeignKey: 'channel_id',
    pivotTimestamps: false,
  })
  public bannedUsers: ManyToMany<typeof Channel>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
