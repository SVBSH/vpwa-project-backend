import { inject } from '@adonisjs/core/build/standalone'
import Logger from '@ioc:Adonis/Core/Logger'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { WsContract } from '@ioc:Ruby184/Socket.IO/Ws'
import { WsSocket } from '@ioc:Ruby184/Socket.IO/WsContext'
import { SocketOperator, UserEventRouterContract } from '@ioc:Services/UserEventRouter'
import User from 'App/Models/User'

interface UserInfo {
  rooms: Set<string>
  sockets: Set<WsSocket>
}

@inject(['Repositories/ChannelRepository', 'Ruby184/Socket.IO/Ws'])
export default class UserEventRouter implements UserEventRouterContract {
  private users = new Map<number, UserInfo>()

  public async updateUserInfo(user: User) {
    const id = user.id
    const channels = await this.ChannelRepository.getChannelsForUser(user)
    const expectedChannelRooms = new Set(channels.map(v => `channel:${v.id}`))

    let info = this.users.get(id)
    if (info === undefined) {
      info = {
        rooms: new Set(expectedChannelRooms),
        sockets: new Set(),
      }
      this.users.set(id, info)
    }

    for (const room of [...info.rooms]) {
      if (!expectedChannelRooms.has(room)) {
        info.rooms.delete(room)
        for (const socket of info.sockets) {
          socket.leave(room)
        }
      }
    }

    for (const room of expectedChannelRooms) {
      if (!info.rooms.has(room)) {
        info.rooms.add(room)
        for (const socket of info.sockets) {
          socket.join(room)
        }
      }
    }

    return info
  }

  public async attachSocket(user: User, socket: WsSocket) {
    const info = await this.updateUserInfo(user)
    const id = user.id

    if (!info.sockets.has(socket)) {
      info.sockets.add(socket)
      Logger.info('User "%s" connected (%s connections)', user.id, info.sockets.size)

      for (const room of info.rooms) {
        socket.join(room)
      }

      socket.on('disconnect', () => {
        info!.sockets.delete(socket)
        Logger.info('User "%s" disconnected (%s connections)', user.id, info.sockets.size)
        if (info!.sockets.size === 0) {
          this.users.delete(id)
        }
      })
    }
  }

  public toUserRooms(user: User) {
    const info = this.users.get(user.id)
    if (info === undefined) {
      throw new Error(`No sockets open for user ${user.id}`)
    }

    let operator = this.Ws.io as SocketOperator
    for (const room of info.rooms) {
      operator = operator.to(room)
    }

    return operator
  }

  constructor(
    private ChannelRepository: ChannelRepositoryContract,
    private Ws: WsContract
  ) { }
}
