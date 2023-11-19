import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ChannelUsersBans extends BaseSchema {
  protected tableName = 'bans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('channel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table.integer('banned_by_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.integer('banned_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('banned_at', { useTz: true })
        .defaultTo(this.now())

      table.unique(['channel_id', 'banned_user_id', 'banned_by_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
