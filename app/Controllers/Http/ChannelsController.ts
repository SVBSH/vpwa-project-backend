import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import JoinChannelValidator from 'App/Validators/JoinChannelValidator'
import { Exception, inject } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import Channel from 'App/Models/Channel'
import Ban from 'App/Models/Ban'

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

    // TODO: validate request parameters
    try {
      const user = await this.UserRepository.getUser(auth.user.id)
      const userChannels = await this.ChannelRepository.getChannelsForUser(user)
      return response.json(userChannels)
    } catch (error) {
      return response.status(error.status || 500).send({ message: error.message })
    }
  }

  /**
   * Get channel with initial data
   * @param param.id Id of the Channel
   * @returns Channel
   */
  public async getChannel({ auth, response, params }: HttpContextContract) {
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }

    try {
      const channel = await this.ChannelRepository.getChannel(parseInt(params.id))
      this.ChannelRepository.getMessagesForChannel(channel)
      await this.UserRepository.getUsersForChannel(channel)
      response.json(channel.serialize())
    } catch (error) {
      return response.status(error.status || 500).json({ message: error.message })
    }
  }

  /**
   * Pagination of messages in the channel.
   * @param param.lastId Id of a last loaded message
   * @returns Channel messages older than provided message id
   */
  public async getChannelMessageRange({ request, response, params }: HttpContextContract) {
    try {
      const inputId = request.input('lastId', -1)

      if (isNaN(inputId)) {
        return response.status(404).json(
          { message: 'Id of the last message must be a number' })
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
      return response
        .status(404)
        .json({ message: 'Channel not found' })
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
    const userId = auth.user.id
    const payload = await request.validate(JoinChannelValidator)

    try {
      const reqChannel = await this.ChannelRepository.getChannel(payload.channelName)

      // check if the user is already a member of the channel
      const reqUserHasChannelMembership = await this.ChannelRepository.hasMember(reqChannel, userId)
      if (reqUserHasChannelMembership) {
        throw new Exception('You are already a member of this channel', 404)
      }

      // user can join only to public channels
      if (!reqChannel.isPublic) {
        return response
          .status(403)
          .json({ message: 'You have no permission to join to private channel.' })
      }

      await this.ChannelRepository.addUser(reqChannel, auth.user.id)
      return response.json(
        { message: `You were added to channel ${payload.channelName}` })
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        const firstErrMessage = error.messages[0]
        return response.status(422).json({
          field: firstErrMessage,
          message: firstErrMessage.message,
        })
      }
      // If channel does not exist create a new one
      if (error.status === 404 && error.message === 'Requested channel does not exist.') {
        const newChannel = await this.ChannelRepository
          .createChannel(userId, payload.channelName, payload.isPublic)

        if (!newChannel) {
          return response.status(500).send('An unexpected error occured')
        }

        this.ChannelRepository.addUser(newChannel, auth.user.id)
        return response.json({ message: `Channel ${payload.channelName} was created.` })
      }
      console.log(error)
      return response.status(error.status || 500).json({ message: error.message })
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

      const isAdmin = await this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (!isAdmin) {
        return response.status(403).json({ message: 'You do not have a permission to remove this channel.' })
      }

      await reqChannel.delete()
      return response.json({ message: 'Channel removed successfully.' })
    } catch (error) {
      return response
        .status(error.status || 500)
        .send({ message: error.message })
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
    if (!auth.user) {
      return response.status(403).json({ message: 'Not authenticated' })
    }
    let channelId = params.id

    if (isNaN(channelId)) {
      return response.status(400).json({ message: 'Invalid channel ID.' })
    }
    channelId = parseInt(channelId)

    try {
      const reqChannel = await this.ChannelRepository.getChannel(channelId)

      await this.UserRepository.getUsersForChannel(reqChannel)

      const isAdmin = await this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (isAdmin) {
        await reqChannel.delete()
        return response
          .json({ message: `Channel ${reqChannel.name} has been removed as the admin left.` })
      }

      const reqUserHasChannelMembership = await this.ChannelRepository.hasMember(reqChannel, auth.user.id)
      if (!reqUserHasChannelMembership) {
        return response
          .status(403)
          .json({ message: 'You are not a member of this channel.' })
      }

      this.ChannelRepository.removeUser(reqChannel, auth.user.id)
      return response.json({ message: `You have left the channel ${reqChannel.name}.` })
    } catch (error) {
      console.log(error)
      return response.status(error.status || 500).send({ message: error.message })
    }
  }

  /**
   * Invite user to requested channel
   */
  public async invite({ auth, request, response }: HttpContextContract) {
    const payload = request.all()
    let channelId = payload.channelId

    if (!auth.user) {
      return
    }

    if (isNaN(channelId)) {
      console.log(channelId)
      return response.status(400)
    }
    channelId = parseInt(channelId)

    if (auth.user.nickname === payload.userNickname) {
      return response.status(403).json({ message: 'You are already a member of this channel' })
    }

    try {
      const invitedUserNickname = payload.userNickname
      const invitedUser = await this.UserRepository.getUser(invitedUserNickname)

      const reqChannel = await this.ChannelRepository.getChannel(channelId)
      if (!reqChannel) {
        return response
          .status(404)
          .json({ message: 'Requested channel does not exist.' })
      }

      const isAlreadyMember = await this.ChannelRepository.hasMember(reqChannel, invitedUser.id)
      if (isAlreadyMember) {
        return response
          .status(403)
          .json({ message: `${invitedUser.nickname} is already a member of this channel.` })
      }

      const hostIsAdmin = await this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (hostIsAdmin) {
        await Ban.query()
          .where('bannedUserId', invitedUser.id)
          .andWhere('channelId', reqChannel.id)
          .delete()
        await this.ChannelRepository.addUser(reqChannel, invitedUser.id)
        return response.json({ message: 'clearing the bans and inviting user to the channel' })
      }

      if (!reqChannel.isPublic) {
        return response
          .status(403)
          .json({ message: 'You do not have a permission to invite other users to this channel.' })
      }

      const channel = await Channel.query()
        .where('id', channelId)
        .preload('bans')
        .firstOrFail()
      const bannCount = channel.bans.length
      if (bannCount >= 1) {
        return response.status(403).json({
          message: 'This user is permanently banned from the requested channel. \
              Only the Admin fo the channel has a permission to invite.',
        })
      }

      await this.ChannelRepository.addUser(reqChannel, invitedUser.id)
      return response.json(
        { message: `${invitedUser.nickname} was invited to the requested channel.` })
    } catch (error) {
      console.log(error)
      return response.status(error.status || 500).send({ message: error.message })
    }
  }

  public async revoke({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return
    }
    const payload = request.all()
    let channelId = payload.channelId
    let targetUserName = payload.targetUser

    try {
      const reqChannel = await this.ChannelRepository.getChannel(channelId)

      const targetUser = await this.UserRepository.getUser(targetUserName)
      if (targetUserName === auth.user.nickname) {
        return response
          .status(403)
          .json({ message: 'You are not allowed to remove yourself.' })
      }

      if (reqChannel.isPublic) {
        return response
          .status(403)
          .json({ message: 'This command can be invoked only in private channels.' })
      }

      const isAdmin = await this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (!isAdmin) {
        return response
          .status(403)
          .json({ message: `You do not have a permission to revoke ${targetUserName}.` })
      }

      this.ChannelRepository.removeUser(reqChannel, targetUser.id)
      return response.json({ message: `User "${targetUser.nickname}" will be removed from "${reqChannel.name}"` })
    } catch (error) {
      // console.log(error)
      return response
        .status(error.status || 500)
        .send({ message: error.message })
    }
  }

  public async kick({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return
    }
    const payload = request.all()
    let channelId = payload.channelId
    let targetUserName = payload.targetUser

    try {
      const reqChannel = await this.ChannelRepository.getChannel(channelId)

      if (!reqChannel.isPublic) {
        return response
          .status(403)
          .json({ message: 'This command can be invoked only in public channels.' })
      }

      const targetUser = await this.UserRepository.getUser(targetUserName)

      const isMember = await this.ChannelRepository.hasMember(reqChannel, targetUser.id)
      if (!isMember) {
        return response
          .status(404)
          .json({ message: `${targetUserName} is not a member of this channel.` })
      }

      if (targetUserName === auth.user.nickname) {
        return response
          .status(403)
          .json({ message: 'You are not allowed to remove yourself.' })
      }

      const isAdmin = await this.ChannelRepository.isAdmin(reqChannel, auth.user.id)
      if (isAdmin) {
        this.ChannelRepository.removeUser(reqChannel, targetUser.id)
        return response.json(
          { message: `User ${targetUser.nickname} is permanently banned from this channel.` })
      }

      const banUserIsAdmin = await this.ChannelRepository.isAdmin(reqChannel, targetUser.id)
      if (banUserIsAdmin) {
        return response
          .status(403)
          .json({ message: 'Admin of the channel can not be banned.' })
      }

      const alreadyBannedFromUser = await Ban
        .query()
        .where('bannedUserId', targetUser.id)
        .andWhere('channelId', reqChannel.id)
        .andWhere('bannedById', auth.user.id)
        .first()

      if (!alreadyBannedFromUser) {
        await Ban.create({
          channelId: reqChannel.id,
          bannedById: auth.user.id,
          bannedUserId: targetUser.id,
        })
        return response.json(
          { message: `User ${targetUser.nickname} is has received ban.` })
      }
      return response
        .status(403)
        .json({ message: `You had already banned "${targetUser.nickname}"` })
    } catch (error) {
      console.log(error)
      return response
        .status(error.status || 500)
        .send({ message: error.message })
    }
  }
}
