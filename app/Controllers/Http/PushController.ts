import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PushManagerContract } from '@ioc:Services/PushManager'
import PushSubscriptionValidator from 'App/Validators/PushSubscriptionValidator'

@inject(['Services/PushManager'])
export default class PushController {
  public getVapidKey() {
    return this.PushManager.getVapidKey()
  }

  public async registerSubscription({ auth, request }: HttpContextContract) {
    const subscription = await request.validate(PushSubscriptionValidator)
    const user = auth.user!

    user.pushSubscription = JSON.stringify(subscription)
    await user.save()
  }

  public async unregisterSubscription({ auth }: HttpContextContract) {
    const user = auth.user!

    user.pushSubscription = null
    await user.save()
  }

  constructor(
    private PushManager: PushManagerContract
  ) { }
}
