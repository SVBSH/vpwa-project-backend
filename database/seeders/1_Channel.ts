import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name'

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: 'general',
        isPublic: false,
      },
      {
        name: 'Channel 1',
        isPublic: false,
      },
      {
        name: 'Channel 2',
        isPublic: false,
      },
    ])
  }
}
