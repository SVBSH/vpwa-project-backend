import { faker } from '@faker-js/faker'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User, { USER_STATE } from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    faker.seed(0)
    await User.updateOrCreateMany('nickname', Array.from({ length: 10 }, () => ({
      nickname: faker.word.noun(),
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: '12345',
      state: faker.helpers.arrayElement(USER_STATE),
      notifications: 'all' as const,
    })))
  }
}
