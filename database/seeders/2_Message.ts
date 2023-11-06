import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Message from 'App/Models/Message'

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = 'content'

    // TODO: fetch users
    await Message.updateOrCreateMany(uniqueKey,
      [
        {
          channelId: 1,
          createdBy: 2,
          content: 'This is some message',
        },
        {
          channelId: 1,
          createdBy: 2,
          content: 'More messages',
        },
        {
          channelId: 1,
          createdBy: 2,
          content: 'loremOccaecat irure mollit magna ad consectetur.',
        },
        {
          channelId: 1,
          createdBy: 2,
          content: 'Voluptate nulla in dolore commodo eiusmod. Laboris\
           labore esse tempor fugiat velit nostrud. Sint ex ipsum do \
           esse officia cupidatat irure. Tempor sunt commodo nostrud \
           commodo esse. Sunt dolor ipsum excepteur irure eu do voluptate.',
        },
        {
          channelId: 2,
          createdBy: 1,
          content: 'This is some message',
        },
      ])
  }
}
