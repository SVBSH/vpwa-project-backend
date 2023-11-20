import { faker } from '@faker-js/faker'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserChannelSeeder extends BaseSeeder {
  public async run() {
    const channels = await Channel.all()
    for (const channel of channels) {
      await channel.related('users').attach([channel.channelAdmin])
    }

    const attached = new Set<string>()
    faker.seed(2)
    for (const user of await User.all()) {
      for (let i = 0; i < 3; i++) {
        const channel = faker.helpers.arrayElement(channels)
        const key = `${user.id},${channel.id}`
        if (attached.has(key) || +channel.channelAdmin === user.id) {
          i--
          continue
        }

        await channel.related('users').attach([user.id])
        attached.add(key)
      }
    }
  }
}
