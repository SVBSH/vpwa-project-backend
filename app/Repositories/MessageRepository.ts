import { inject } from '@adonisjs/core/build/standalone'
import { ChannelMessage, MessageRepositoryContract, RawMessage } from '@ioc:Repositories/MessageRepository'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

@inject(['Services/UserEventRouter'])
export default class MessageRepository implements MessageRepositoryContract {
  public async createMessage(user: User, channel: number, text: string) {
    await Message.create({
      channelId: channel,
      content: text,
      createdBy: user.id,
    })

    this.UserEventRouter.toUserRooms(user).emit('channel_message', { channel, text, author: user.id } as ChannelMessage)
  }

  constructor(
    private UserEventRouter: UserEventRouterContract
  ) { }
}
