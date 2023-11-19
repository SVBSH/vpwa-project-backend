import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import JoinChannelValidator from 'App/Validators/JoinChannelValidator'
import ChannelService from 'App/Services/ChannelService'
import { inject } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'

@inject(['Repositories/UserRepository', 'Repositories/ChannelRepository'])
export default class ChannelsController {
  constructor(
    private UserRepository: UserRepositoryContract,
    private ChannelRepository: ChannelRepositoryContract
  ) { }

  /**
   * Get the list of channels that the authenticated user belongs to.
   * @returns A JSON response with the list of channels.
   */
  public async getChannels({ auth, response }: HttpContextContract) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }
    const user = await this.UserRepository.getUser(auth.user.id)
    if (!user) {
      return response.status(404).json({ message: 'User does not exist.' })
    }
    const userChannels = await this.ChannelRepository.getChannelsForUser(user)
    return response.json(userChannels)
  }

  /**
   * Get channel with initial data
   * @param param.id Id of the Channel
   * @returns Channel
   */
  public async getChannel({ response, params }: HttpContextContract) {
    try {
      const channel = await this.ChannelRepository.getChannel(parseInt(params.id))
      if (!channel) {
        return response.status(404).json({ message: 'Channel not found' })
      }
      await this.ChannelRepository.getMessagesForChannel(channel)

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
  public async getChannelMessages({ request, response, params }: HttpContextContract) {
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
   * Retrieves messages in a channel that are newer than a specified message ID.
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

  /**
   * Allows an authenticated user to join a channel.
   * If the channel does not exist, it is created.
   *
   * Also checks if the user is already a member of
   * the channel, and if not, adds the user to the channel.
   *
   * If the user attempts to join a private channel and is not allowed, an error is returned.
   * In the case of the channel not existing, it is created with the current user as the admin.
   */
  public async joinChannel({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }

    try {
      const userId = auth.user.id
      const payload = await request.validate(JoinChannelValidator)

      const reqChannel = await this.ChannelRepository.getChannel(payload.channelName)

      // if channel exist create a new channel
      if (!reqChannel) {
        const newChannel = await this.ChannelRepository
          .createChannel(userId, payload.channelName, payload.isPublic)

        if (!newChannel) {
          return response.status(500).send('An unexpected error occured')
        }

        this.ChannelRepository.addUser(newChannel, auth.user.id)
        return response.json({ message: `Channel ${payload.channelName} was created.` })
      }

      // check if the user is already a member of the channel
      const isMember = await this.ChannelRepository.hasMember(reqChannel, userId)
      if (isMember) {
        return response.status(404).json({ message: 'You are already a member of this channel' })
      }

      // user can join only to public channels
      if (!reqChannel.isPublic) {
        return response.status(403).json({ message: 'You have no permission to join to private channel.' })
      }

      await this.ChannelRepository.addUser(reqChannel, auth.user.id)
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
  public async quitChannel({ auth, params, response }: HttpContextContract) {
    if (!auth.user) {
      return response.status(500).json({ message: 'Not authenticated' })
    }

    try {
      let channelId = params.id

      if (isNaN(channelId)) {
        return response.status(400).json({ message: 'Invalid channel ID.' })
      }
      channelId = parseInt(channelId)

      const reqChannel = await this.ChannelRepository.getChannel(channelId)
      if (!reqChannel) {
        return response.status(404).json({ message: 'Requested channel does not exist.' })
      }
      // FIXME: reqChannel.channelAdmin is string ??
      const isAdmin = parseInt(reqChannel.channelAdmin) === parseInt(auth.user.id)

      if (!isAdmin) {
        return response.status(403).json({ message: 'You do not have a permission to remove this channel.' })
      }

      await reqChannel.delete()
      return response.json({ message: 'Channel removed successfully.' })
    } catch (error) {
      return response.status(500).send('An unexpected error occured.')
    }
  }

  /**
  * Allows a user to leave a channel or an admin to delete the channel.
  * If the user is an admin, the channel is deleted. Otherwise, the user
  * is just removed from the channel.
  * @param {number} params.id - The ID of the channel to leave or delete.
  * @returns A JSON response with the result of the operation.
  */
  public async cancelChannel({ auth, params, response }: HttpContextContract) {
    let channelId = params.id

    if (isNaN(channelId)) {
      return response.status(400).json({ message: 'Invalid channel ID.' })
    }
    channelId = parseInt(channelId)
    try {
      const reqChannel = await Channel
        .query()
        .preload('users')
        .where('id', channelId)
        .first()
      if (!reqChannel) {
        return response.status(404).json({ message: 'Requested channel does not exist.' })
      }
      const isAdmin = parseInt(reqChannel.channelAdmin) === parseInt(auth.user.id)
      if (isAdmin) {
        await reqChannel.delete()
        return response.json({ message: `Channel ${reqChannel.name} has been removed as the admin left.` })
      }

      const isMember = reqChannel.users.some(user => user.id === auth.user.id)
      if (!isMember) {
        return response.status(403).json({ message: 'You are not a member of this channel.' })
      }

      await reqChannel.related('users').detach([auth.user.id])
      return response.json({ message: `You have left channel ${reqChannel.name}.` })
    } catch (error) {
      return response.status(500).send('An unexpected error occured.')
    }
  }

  /**
   * Invite user to requested channel
   */
  public async invite({ auth, request, params, response }: HttpContextContract) {
    const payload = request.all()
    const channelId = payload.channelId
    console.log()

    if (!auth.user) {
      return
    }

    if (isNaN(channelId)) {
      console.log(channelId)
      return response.status(400)
    }

    if (auth.user.nickname === payload.userNickname) {
      return response.status(403).json({ message: 'You are already a member of this channel' })
    }

    try {
      const invitedUserNickname = payload.userNickname
      const invitedUser =
        await User
          .query()
          .where('nickname', invitedUserNickname)
          .first()

      if (!invitedUser) {
        return response
          .status(404)
          .json({ message: 'Invited user does not exist' })
      }
      const reqChannel =
        await Channel
          .query()
          .where('id', channelId)
          .first()
      if (!reqChannel) {
        return response
          .status(404)
          .json({ message: 'Invintation channel does not exist.' })
      }

      const isAlreadyMember = await ChannelService.checkUserInChannel(reqChannel.id, invitedUser.id)
      if (isAlreadyMember) {
        return response.status(403).json({ message: 'User is already a member of this channel.' })
      }

      const hostIsAdmin = this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (!reqChannel.isPublic && !hostIsAdmin) {
        return response
          .status(403)
          .json({ message: 'You do not have a permission to invite other users to this channel.' })
      }

      const guestBannedListQuery = reqChannel
        .related('bannedMembers')
        .pivotQuery()
        .where('channel_id', reqChannel.id)
        .andWhere('banned_user_id', invitedUser.id)

      const guestBannedCount = await guestBannedListQuery
        .count('* as total')
        .first()
      if (guestBannedCount.total > 1) {
        if (!hostIsAdmin) {
          return response.send(403).json({
            message: 'This user is permanently banned from the requested channel. \
              Only the Admin fo the channel has a permission to invite.',
          })
        }
        // Clear the banned records
        await guestBannedListQuery.delete()
      }

      const isAlreadyInvited = await ChannelService.checkUserIsInvited(channelId, invitedUser.id)

      if (isAlreadyInvited) {
        return response.status(403).json(
          { message: `${invitedUser.nickname} was already invited to requested channel.` })
      }
      await this.ChannelRepository.addUser(reqChannel, invitedUser.id)
      return response.json(
        { message: `${invitedUser.nickname} was invited to the requested channel.` })
    } catch (error) {
      console.log(error)
      return response.status(500).send('An unexpected error occured.')
    }
  }

  // TODO: clear all invite records
  public acceptInvintation({ auth, request, params, response }: HttpContextContract) {
  }
}
