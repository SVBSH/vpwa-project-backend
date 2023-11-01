import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    User.updateOrCreateMany('nickname', [
      { nickname: 'foo', name: 'Jano', surname: 'Foo', password: '12345', state: 'offline', email: 'foo@example.com' },
      { nickname: 'bar', name: 'Ondro', surname: 'Bar', password: '12345', state: 'online', email: 'bar@example.com' },
      { nickname: 'baz', name: 'Jano', surname: 'Baz', password: '12345', state: 'dnd', email: 'baz@example.com' },
    ])
  }
}
