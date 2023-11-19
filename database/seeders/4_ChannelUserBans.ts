import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Logger from '@ioc:Adonis/Core/Logger'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import Ban from 'App/Models/Ban'

export default class extends BaseSeeder {
  public async run() {
    const userFoo = await User.findBy('nickname', 'foo')
    const userBar = await User.findBy('nickname', 'bar')
    const userBaz = await User.findBy('nickname', 'baz')

    if (!userFoo || !userBar || !userBaz) {
      Logger.warn('One or more users not found. Seeder did not run.')
      return
    }

    const channelGeneral = await Channel.findBy('name', 'general')
    const channelChannel1 = await Channel.findBy('name', 'Channel 1')

    if (!channelGeneral || !channelChannel1) {
      Logger.warn('Channel <Channel 1> not found. Seeder did not run.')
      return
    }

    await Ban.create({
      channelId: channelGeneral.id,
      bannedById: userFoo.id,
      bannedUserId: userBar.id,
    })

    await Ban.create({
      channelId: channelChannel1.id,
      bannedById: userFoo.id,
      bannedUserId: userBaz.id,
    })
  }
}
