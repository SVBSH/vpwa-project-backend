import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'content'

    const userFoo = await User.findBy('nickname', 'foo')
    const userBar = await User.findBy('nickname', 'bar')

    if (userFoo === null || userBar === null) {
      return
    }

    const channelGeneral = await Channel.findBy('name', 'general')
    const channelChannel1 = await Channel.findBy('name', 'Channel 1')
    if (channelGeneral === null || channelChannel1 === null) {
      return
    }

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
  }
}
