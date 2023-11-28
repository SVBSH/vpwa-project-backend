import { inject } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import Channel from 'App/Models/Channel'
import { RawMessageValidator } from 'App/Validators/RawMessageValidator'

@inject(['Repositories/MessageRepository', 'Services/UserEventRouter', 'Repositories/ChannelRepository'])
export default class MessageController {
  public async onConnected({ socket, auth }: WsContextContract) {
    const user = auth.user!
    await this.UserEventRouter.attachSocket(user, socket)
  }

  public async postMessage({ auth }: WsContextContract, data: unknown) {
    const user = auth.user!
    const msg = await RawMessageValidator.validate(data)
    const channel = await Channel.findByOrFail('id', msg.channel)
    const isUserInChannel = await this.ChannelRepository.hasMember(channel, user.id)

    if (isUserInChannel) {
      await this.MessageRepository.createMessage(user, channel, msg.text)
    } else {
      throw new Error('User is not in selected channel')
    }
  }

  public async updateTyping({ auth }: WsContextContract, data: unknown) {
    const user = auth.user!
    const msg = await RawMessageValidator.validate(data)
    const channel = await Channel.findByOrFail('id', msg.channel)
    const isUserInChannel = await this.ChannelRepository.hasMember(channel, user.id)

    if (isUserInChannel) {
      await this.MessageRepository.broadcastTyping(user, channel, msg.text)
    } else {
      throw new Error('User is not in selected channel')
    }
  }

  constructor(
    private MessageRepository: MessageRepositoryContract,
    private UserEventRouter: UserEventRouterContract,
    private ChannelRepository: ChannelRepositoryContract
  ) { }
}
