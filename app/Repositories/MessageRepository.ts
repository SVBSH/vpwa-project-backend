import { inject } from '@adonisjs/core/build/standalone'
import { ChannelMessage, MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

@inject(['Services/UserEventRouter'])
export default class MessageRepository implements MessageRepositoryContract {
  public async createMessage(user: User, channel: number, text: string) {
    const message = await Message.create({
      channelId: channel,
      content: text,
      createdBy: user.id,
    })

    this.UserEventRouter.toUserRooms(user).emit(
      'channel_message',
      { id: message.id, channel, text, author: user.id } as ChannelMessage
    )
  }

  constructor(
    private UserEventRouter: UserEventRouterContract
  ) { }
}
