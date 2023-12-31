import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {
  }

  public register() {
    // Register your own bindings

    this.app.container.singleton('Repositories/UserRepository', (container) => {
      return container.make('App/Repositories/UserRepository')
    })

    this.app.container.singleton('Repositories/ChannelRepository', (container) => {
      return container.make('App/Repositories/ChannelRepository')
    })

    this.app.container.singleton('Repositories/MessageRepository', (container) => {
      return container.make('App/Repositories/MessageRepository')
    })

    this.app.container.singleton('Repositories/BanRepository', (container) => {
      return container.make('App/Repositories/BanRepository')
    })

    this.app.container.singleton('Services/UserEventRouter', (container) => {
      return container.make('App/Services/UserEventRouter')
    })

    this.app.container.singleton('Services/PushManager', (container) => {
      return container.make('App/Services/PushManager')
    })
  }

  public async boot() {
    // IoC container is ready
    this.app.container.make('App/Services/IdleChannelDeleter')
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
