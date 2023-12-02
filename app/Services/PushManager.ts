import env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { PushManagerContract } from '@ioc:Services/PushManager'
import User from 'App/Models/User'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PushSubscription, VapidKeys, generateVAPIDKeys, sendNotification } from 'web-push'

const KEY_STORE_SCHEMA = schema.create({
  publicKey: schema.string(),
  privateKey: schema.string(),
})

export default class PushManager implements PushManagerContract {
  protected _keys: VapidKeys | null = null
  protected _keyPath = resolve('vapid.json')

  protected async ensureKeys() {
    if (this._keys === null) {
      let keys: VapidKeys | null = null
      try {
        const data = await readFile(this._keyPath).then(v => v.toString())
        keys = await validator.validate({ schema: KEY_STORE_SCHEMA, data: JSON.parse(data) })
      } catch {
        keys = null
      }

      if (keys === null) {
        const generated = generateVAPIDKeys()
        this._keys = generated
        await writeFile(this._keyPath, JSON.stringify(generated))
      } else {
        this._keys = keys
      }
    }

    return this._keys
  }

  public async getVapidKey() {
    const { publicKey } = await this.ensureKeys()
    return publicKey
  }

  public async sendNotification(user: User, data: string) {
    const { privateKey, publicKey } = await this.ensureKeys()

    if (!user.pushSubscription) {
      return
    }

    const subscription = JSON.parse(user.pushSubscription) as PushSubscription

    try {
      await sendNotification(subscription, data, {
        vapidDetails: {
          publicKey, privateKey,
          subject: env.get('VAPID_SUBJECT'),
        },
      })
    } catch {
      // Subscription is invalid
      user.pushSubscription = null
      user.notifications = 'none'
      Logger.warn('Subscription invalid for user %s', user.nickname)
      await user.save()
      return
    }

    Logger.info('Sent push notification to %s', user.nickname)
  }
}
