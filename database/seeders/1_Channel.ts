import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'
    const channelAdmin = await User.findBy('nickname', 'foo')
    if (!channelAdmin) {
      Logger.warn('User <foo> not found. Seeder did not run.')
      return
    }

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: 'general',
        isPublic: false,
        channelAdmin: channelAdmin.id,
      },
      {
        name: 'Channel 1',
        isPublic: true,
        channelAdmin: channelAdmin.id,
      },
      {
        name: 'Channel 2',
        isPublic: false,
        channelAdmin: channelAdmin.id,
      },
    ])
  }
}
