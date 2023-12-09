import { inject } from '@adonisjs/core/build/standalone'
import { ChannelMessage, MessageRepositoryContract, UserTypingMessage } from '@ioc:Repositories/MessageRepository'
import { PushManagerContract, PushMessage } from '@ioc:Services/PushManager'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

@inject(['Services/UserEventRouter', 'Services/PushManager'])
export default class MessageRepository implements MessageRepositoryContract {
  public async createMessage(author: User, channel: Channel, text: string) {
    const message = await Message.create({
      channelId: channel.id,
      content: text,
      createdBy: author.id,
    })

    this.UserEventRouter.toChannel(channel).emit(
      'channel_message',
      { id: message.id, channel: channel.id, text, author: author.id } as ChannelMessage
    )

    await channel.load('users')
    for (const user of channel.users) {
      const allow = (
        user.pushSubscription !== null &&
        user.notifications !== 'none' &&
        user.state === 'online' &&
        (
          user.notifications === 'mentioned' ? (
            text.includes('@' + user.nickname)
          ) : (
            true
          )
        )
      )

      if (!allow) {
        continue
      }

      const message: PushMessage = { author: author.nickname, channel: channel.id, text: text, recipient: user.id }
      this.PushManager.sendNotification(user, JSON.stringify(message))
    }
  }

  public async broadcastTyping(user: User, channel: Channel, text: string) {
    this.UserEventRouter.toChannel(channel).emit(
      'user_typing',
      { channel: channel.id, text, author: user.id } as UserTypingMessage
    )
  }

  constructor(
    private UserEventRouter: UserEventRouterContract,
    private PushManager: PushManagerContract
  ) { }
}
