import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Logger from '@ioc:Adonis/Core/Logger'

import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    const userFoo = await User.findBy('nickname', 'foo')
    const userBar = await User.findBy('nickname', 'bar')
    const userBaz = await User.findBy('nickname', 'baz')

    if (!userFoo || !userBar || !userBaz) {
      Logger.warn('Users <foo> or <bar> or <baz> not found. Seeder did not run.')
      return
    }

    const channel2 = await Channel.findBy('name', 'Channel 1')
    if (!channel2) {
      Logger.warn('Channel <Channel 2> not found. Seeder did not run.')
      return
    }

    await channel2.related('bannedMembers').attach({
      [userFoo.id]: {
        banned_by: userBar.id,
      },
    })

    await channel2.related('bannedMembers').attach({
      [userFoo.id]: {
        banned_by: userBaz.id,
      },
    })
  }
}
