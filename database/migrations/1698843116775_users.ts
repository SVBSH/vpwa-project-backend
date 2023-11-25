import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { USER_NOTIFY_SETTINGS, USER_STATE } from 'App/Models/User'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nickname', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('name', 255).notNullable()
      table.string('surname', 255).notNullable()
      table.string('email', 255).notNullable()
      table.enum('state', USER_STATE)
      table.enum('notifications', USER_NOTIFY_SETTINGS)

      table.string('remember_me_token').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
