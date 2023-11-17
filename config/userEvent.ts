declare module '@ioc:Services/UserEventRouter' {
  import { WsSocket } from '@ioc:Ruby184/Socket.IO/WsContext'
  import User from 'App/Models/User'

  export type SocketOperator = Pick<WsSocket, 'emit' | 'to'>

  export interface UserEventRouterContract {
    updateUserInfo(user: User): Promise<unknown>
    attachSocket(user: User, socket: WsSocket): Promise<unknown>
    toUserRooms(user: User): SocketOperator
  }

  const UserEventRouter: UserEventRouterContract
  export default UserEventRouter
}
