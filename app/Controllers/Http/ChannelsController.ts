import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import JoinChannelValidator from 'App/Validators/JoinChannelValidator'
import QuitChannelValidator from 'App/Validators/QuitChannelValidator'

export default class ChannelsController {
  public async getChannels({ auth, response }: HttpContextContract) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
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

  /**
   *  Get channel with initial data
   * @param param.id Id of the Channel
   * @returns Channel
   */
  public async getChannel({ response, params, auth }) {
    try {
      const channel = await Channel
        .query()
        .where({ id: params.id })
        .preload('messages', (messagesQuery) => {
          messagesQuery.orderBy('id', 'desc')
            .limit(2)
        })
        .preload('users')
        .firstOrFail()
      response.json(channel.serialize())
    } catch (e) {
      return response.status(404).json({ message: 'Channel not found' })
    }
  }

  /**
   * Pagination of messages in the channel.
   * @param param.lastId Id of a last loaded message
   * @returns Channel messages older than provided message id
   */
  public async getChannelMessages({ request, response, params, auth }: HttpContextContract) {
    try {
      const inputId = request.input('lastId', -1)

      if (isNaN(inputId)) {
        return response.status(404).json({ message: 'Id of the last message must be a number' })
      }
      const lastId = parseInt(inputId)
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

  /**
   * @param params.lastId Id of a last loaded message
   * @returns Messages added since the last loaded message
   */
  public async getUpdatedChannelMessages({ request, response, params }: HttpContextContract) {
    let lastId = request.input('lastId', -1)
    const channelId = params.id

    if (isNaN(lastId)) {
      return response.status(404).json({ message: 'Id of the last message must be a number' })
    }

    lastId = parseInt(lastId)
    let newMessages = await Message
      .query()
      .where('channelId', channelId)
      .andWhere('id', '>', lastId)
    return response.json(newMessages)
  }

  // TODO:
  public async leave() {

  }
  // TODO:
  public async joinChannel({ auth, request, response }) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }

    try {
      const userId = auth.user.id
      const payload = await request.validate(JoinChannelValidator)

      const reqChannel = await Channel
        .query()
        .preload('users')
        .where('name', payload.channelName)
        .first()

      // if channel exist create a new channel
      if (!reqChannel) {
        const newChannel = await Channel.create({
          channelAdmin: userId,
          isPublic: payload.isPublic,
          name: payload.channelName,
        })

        if (!newChannel) {
          return response.status(500).send('An unexpected error occured')
        }
        newChannel.related('users').attach([auth.user.id])
        return response.json({ message: `Channel ${payload.channelName} was created.` })
      }

      const isMember = reqChannel.users.find(user => user.id === userId)
      if (isMember) {
        return response.status(404).json({ message: 'You are already a member of this channel' })
      }

      // user can join only to public channels
      if (!reqChannel.isPublic) {
        return response.status(403).json({ message: 'You have no permission to join to private channel.' })
      }
      // TODO: validate response
      await reqChannel.related('users').attach([auth.user.id])
      return response.json({ message: `You were added to channel ${payload.channelName}` })
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        const firstErrMessage = error.messages[0]
        return response.status(422).json({
          field: firstErrMessage,
          message: firstErrMessage.message,
        })
      }

      return response.status(500).send('An unexpected error occured')
    }
  }

  /**
   * Allow admin of the channel to leave his channel. After that,
   * the channel will be destroyed.
   */
  public async quitChannel({ auth, params, response }) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }

    try {
      let channelId = params.id

      if (isNaN(channelId)) {
        return response.status(400).json({ message: 'Invalid channel ID' })
      }
      channelId = parseInt(channelId)

      const channel = await Channel.find(channelId)
      if (!channel) {
        return response.status(404).json({ message: 'Channel not found' })
      }

      const reqChannel = await Channel
        .query()
        .where('id', channelId)
        .first()
      if (!reqChannel) {
        return response.status(404).json({ message: 'Requested channel does not exist' })
      }
      // FIXME: reqChannel.channelAdmin is string ??
      const isAdmin = parseInt(reqChannel.channelAdmin) === parseInt(auth.user.id)

      if (!isAdmin) {
        return response.status(403).json({ message: 'You do not have a permission to remove this channel' })
      }

      await reqChannel.delete()
      return response.json({ message: 'Channel removed successfully' })
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        const firstErrMessage = error.messages[0]
        return response.status(422).json({
          field: firstErrMessage,
          message: firstErrMessage.message,
        })
      }
      console.log(error)

      return response.status(500).send('An unexpected error occured')
    }
  }
}
