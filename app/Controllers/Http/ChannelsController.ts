import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class ChannelsController {
  public async getChannels({ auth, response }: HttpContextContract) {
    if (!auth.user) {
      return response.status(404).json({ message: 'User does not exist.' })
    }

    const userWithChannels =
      await User
        .query()
        .where('id', auth.user.id)
        .preload('channels')
        .first()
    if (!userWithChannels) {
      return response.status(404).json({ message: 'User does not exist.' })
    }
    return response.json(userWithChannels.channels)
  }
  public async getChannel({ response, params, auth }) {
    console.log(auth.user)
    try {
      const channel = await Channel
        .query()
        .where({ id: params.id })
        .firstOrFail()
      response.json(channel)
    } catch (e) {
      return response.status(404).json({ message: 'Channel not found' })
    }
  }
  /**
   * Pagination of messages in the channel.
   * @param param
   * @returns
   */
  public async getChannelMessages({ request, response, params, auth }: HttpContextContract) {
    try {
      const lastId = parseInt(request.input('lastId', -1))
      const limit = 2
      const channelId = params.id

      // return last <limit> number of messages
      let query = Message.query().where('channelId', channelId)
      if (lastId !== -1) {
        query.andWhere('id', '<', lastId)
      }

      const message = await query.orderBy('id', 'desc')
        .limit(limit)
        .then(messages => messages.reverse())
      return response.json(message)
    } catch (e) {
      return response.status(404).json({ message: 'Channel not found' })
    }
  }
  // TODO:
  public async leave() {

  }
  // TODO:
  public async join() {

  }
}
