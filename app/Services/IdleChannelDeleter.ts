import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import { DateTime } from 'luxon'

export default class IdleChannelDeleter {
  constructor() {
    setInterval(async () => {
      const channels = await Channel.all()
      const time = DateTime.now()

      for (const channel of channels) {
        let lastTime = channel.createdAt
        const lastMessage = await Message.query().where('channelId', channel.id).orderBy('createdAt', 'desc').first()
        if (lastMessage) {
          lastTime = lastMessage.createdAt
        }

        if (time.diff(lastTime, ['days']).days > 30) {
          await channel.delete()
        }
      }
    }, 10000 /* 10 seconds */)
  }
}
