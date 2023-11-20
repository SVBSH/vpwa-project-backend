import { faker } from '@faker-js/faker'
import Logger from '@ioc:Adonis/Core/Logger'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Ban from 'App/Models/Ban'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    const channels = await Channel.query().preload('users').select()

    faker.seed(4)
    const targetChannel = faker.helpers.arrayElement(channels.filter(v => v.type === 'public' && v.users.length >= 4))
    const pool = new Set<User>(targetChannel.users)
    const targetUser = faker.helpers.arrayElement([...pool])
    pool.delete(targetUser)

    for (let i = 0; i < 3; i++) {
      const banner = faker.helpers.arrayElement([...pool])
      pool.delete(banner)
      await Ban.create({
        channelId: targetChannel.id,
        bannedById: banner.id,
        bannedUserId: targetUser.id,
      })
    }

    await targetChannel.related('users').detach([targetUser.id])
    Logger.info('Banned user %s in channel %s', targetUser.nickname, targetChannel.name)
  }
}
