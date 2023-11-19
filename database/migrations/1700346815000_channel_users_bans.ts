import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'channel_users_bans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table
        .integer('banned_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
      // .onDelete('CASCADE')

      table
        .timestamp('banned_at', { useTz: true })
        .defaultTo(this.now())

      table.unique(['user_id', 'channel_id', 'banned_by'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
