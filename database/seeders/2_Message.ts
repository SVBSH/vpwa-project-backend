import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'content'

    // Fetch users
    const userFoo = await User.findBy('nickname', 'foo')
    const userBar = await User.findBy('nickname', 'bar')
    if (!userFoo || !userBar) {
      Logger.warn('Users <foo> or <bar> not found. Seeder did not run.')
      return
    }
    // Fetch channels
    const channelGeneral = await Channel.findBy('name', 'general')
    const channelChannel1 = await Channel.findBy('name', 'Channel 1')
    if (!channelGeneral || !channelChannel1) {
      Logger.warn('Channels <general> or <Channel 1> not found. Seeder did not run.')
      return
    }
    try {
      await Message.updateOrCreateMany(uniqueKey,
        [
          {
            channelId: channelGeneral.id,
            createdBy: userFoo.id,
            content: 'This is some message',
          },
          {
            channelId: channelGeneral.id,
            createdBy: userFoo.id,
            content: 'More messages',
          },
          {
            channelId: channelGeneral.id,
            createdBy: userFoo.id,
            content: 'loremOccaecat irure mollit magna ad consectetur.',
          },
          {
            channelId: channelGeneral.id,
            createdBy: userBar.id,
            content: 'Voluptate nulla in dolore commodo eiusmod. Laboris\
           labore esse tempor fugiat velit nostrud. Sint ex ipsum do \
           esse officia cupidatat irure. Tempor sunt commodo nostrud \
           commodo esse. Sunt dolor ipsum excepteur irure eu do voluptate.',
          },
          {
            channelId: channelChannel1.id,
            createdBy: userFoo.id,
            content: 'This is some message',
          },
        ])
    } catch (e) {
      Logger.error(e)
    }
  }
}
