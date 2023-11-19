import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Logger from '@ioc:Adonis/Core/Logger'

import User from 'App/Models/User'
import Channel from 'App/Models/Channel'

export default class extends BaseSeeder {
  public async run() {
    const userFoo = await User.findBy('nickname', 'foo')
    const userBar = await User.findBy('nickname', 'bar')
    const userBaz = await User.findBy('nickname', 'baz')

    if (!userFoo || !userBar || !userBaz) {
      Logger.warn('Users <foo> or <bar> or <baz> not found. Seeder did not run.')
      return
    }

    const channelGeneral = await Channel.findBy('name', 'general')
    if (!channelGeneral) {
      Logger.warn('Channel <Channel 2> not found. Seeder did not run.')
      return
    }

    await channelGeneral
      .related('invitedMembers')
      .attach({
        [userFoo.id]: {
          guest_id: userBar.id,
        },
      })
  }
}
