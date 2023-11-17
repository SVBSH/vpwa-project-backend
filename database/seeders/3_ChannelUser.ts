import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserChannelSeeder extends BaseSeeder {
  public async run() {
    // Find users and channels to establish relationships
    const user1 = await User.findBy('nickname', 'foo')
    const user2 = await User.findBy('nickname', 'bar')
    const user3 = await User.findBy('nickname', 'baz')
    const channel1 = await Channel.findBy('name', 'general')
    const channel2 = await Channel.findBy('name', 'Channel 1')

    if (user1 && channel1) {
      await user1.related('channels').attach([channel1.id])
    }
    if (user2 && channel2) {
      await user2.related('channels').attach([channel2.id])
    }
    if (user3 && channel1) {
      await user3.related('channels').attach([channel1.id])
    }
  }
}
