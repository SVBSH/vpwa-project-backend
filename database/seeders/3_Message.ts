import { faker } from '@faker-js/faker'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'

export default class extends BaseSeeder {
  public async run() {
    const channels = await Channel.query().preload('users').select()

    faker.seed(3)
    const messagesToCreate: Partial<Message>[] = []
    for (const channel of channels) {
      for (let i = 0; i < 50; i++) {
        const user = faker.helpers.arrayElement(channel.users)
        messagesToCreate.push({
          createdBy: user.id,
          channelId: channel.id,
          content: faker.hacker.phrase().slice(0, -1),
        })
      }
    }

    await Message.updateOrCreateMany('content', messagesToCreate)
  }
}
