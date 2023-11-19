import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'
    const userFoo = await User.findBy('nickname', 'foo')

    if (!userFoo) {
      Logger.warn('User <foo> not found. Seeder did not run.')
      return
    }

    const userBar = await User.findBy('nickname', 'bar')
    if (!userBar) {
      Logger.warn('User <bar> not found. Seeder did not run.')
      return
    }

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: 'general',
        isPublic: false,
        channelAdmin: userFoo.id,
      },
      {
        name: 'Channel 1',
        isPublic: true,
        channelAdmin: userBar.id,
      },
      {
        name: 'Channel 2',
        isPublic: true,
        channelAdmin: userFoo.id,
      },
      {
        name: 'Channel 3',
        isPublic: false,
        channelAdmin: userFoo.id,
      },
    ])
  }
}
