import { inject } from '@adonisjs/core/build/standalone'
import { ChannelMessage, MessageRepositoryContract, UserTypingMessage } from '@ioc:Repositories/MessageRepository'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

@inject(['Services/UserEventRouter'])
export default class MessageRepository implements MessageRepositoryContract {
  public async createMessage(user: User, channel: Channel, text: string) {
    const message = await Message.create({
      channelId: channel.id,
      content: text,
      createdBy: user.id,
    })

    this.UserEventRouter.toChannel(channel).emit(
      'channel_message',
      { id: message.id, channel: channel.id, text, author: user.id } as ChannelMessage
    )
  }

  public async broadcastTyping(user: User, channel: Channel, text: string) {
    this.UserEventRouter.toChannel(channel).emit(
      'user_typing',
      { channel: channel.id, text, author: user.id } as UserTypingMessage
    )
  }

  constructor(
    private UserEventRouter: UserEventRouterContract
  ) { }
}
