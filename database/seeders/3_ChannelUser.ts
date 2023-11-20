import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserChannelSeeder extends BaseSeeder {
  public async run() {
    // Find users and channels to establish relationships
    const user1 = await User.findBy('nickname', 'foo')
    const user2 = await User.findBy('nickname', 'bar')
    const user3 = await User.findBy('nickname', 'baz')
    const userSvato = await User.findBy('nickname', 'svt')

    const channelGeneral = await Channel.findBy('name', 'general')
    const channel1 = await Channel.findBy('name', 'Channel 1')
    const channel2 = await Channel.findBy('name', 'Channel 2')

    if (!user1 || !user2 || !user3 || !userSvato) {
      return
    }

    if (!channelGeneral || !channel1 || !channel2) {
      return
    }

    channelGeneral.related('users').attach([user1.id, user2.id, user3.id])
    channel1.related('users').attach([user1.id, user2.id, user3.id, userSvato.id])
    channel2.related('users').attach([user1.id, userSvato.id])
  }
}
