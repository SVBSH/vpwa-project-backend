
declare module '@ioc:Services/PushManager' {
  import User from 'App/Models/User'

  export interface PushManagerContract {
    getVapidKey(): Promise<string>
    sendNotification(user: User, data: string): Promise<unknown>
  }

  export interface PushMessage {
    recipient: number
    author: string
    text: string
    channel: number
  }

  const PushManager: PushManagerContract
  export default PushManager
}
