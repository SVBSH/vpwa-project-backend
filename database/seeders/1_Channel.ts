import { faker } from '@faker-js/faker'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const users = await User.all()

    faker.seed(1)
    await Channel.updateOrCreateMany('name', Array.from({ length: 10 }, () => {
      const admin = faker.helpers.arrayElement(users)

      return {
        channelAdmin: admin.id,
        name: faker.word.noun(),
        isPublic: faker.datatype.boolean(),
      }
    }))
  }
}
