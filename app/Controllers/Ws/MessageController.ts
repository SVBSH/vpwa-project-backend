import { inject } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import { RawMessageValidator } from 'App/Validators/RawMessageValidator'

@inject(['Repositories/MessageRepository', 'Services/UserEventRouter'])
export default class MessageController {
  public async onConnected({ socket, auth }: WsContextContract) {
    const user = auth.user!
    await this.UserEventRouter.attachSocket(user, socket)
  }

  public async postMessage({ auth }: WsContextContract, data: unknown) {
    const user = auth.user!
    const msg = await RawMessageValidator.validate(data)
    const isUserInChannel = await Database.query()
      .from('channel_users')
      .where('user_id', user.id)
      .andWhere('channel_id', msg.channel)
      .select('id')

    if (isUserInChannel.length > 0) {
      await this.MessageRepository.createMessage(user, msg.channel, msg.text)
    } else {
      throw new Error('User is not in selected channel')
    }
  }

  constructor(
    private MessageRepository: MessageRepositoryContract,
    private UserEventRouter: UserEventRouterContract
  ) { }
}
