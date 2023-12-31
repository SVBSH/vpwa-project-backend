/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
}).prefix('auth')

Route
  .group(() => {
    Route.get('/', 'ChannelsController.getChannels')
    Route.get('/:id', 'ChannelsController.getChannel')
    Route.get('/:id/messages', 'ChannelsController.getChannelMessageRange')
    Route.get('/:id/updateMessages', 'ChannelsController.getUpdatedChannelMessages')
    Route.post('/join', 'ChannelsController.joinChannel')
    Route.post('/invite', 'ChannelsController.invite')
    Route.delete('/:id/quit', 'ChannelsController.quitChannel')
    Route.delete('/:id/cancel', 'ChannelsController.cancelChannel')
    Route.post('/revoke', 'ChannelsController.revoke')
    Route.post('/kick', 'ChannelsController.kick')
  })
  .prefix('channel')
  .middleware('auth')

Route
  .group(() => {
    Route.post('/state', 'UsersController.setState')
    Route.post('/settings', 'UsersController.updateSettings')
  })
  .prefix('user')
  .middleware('auth')

Route
  .group(() => {
    Route.get('/key', 'PushController.getVapidKey')
    Route.post('/register', 'PushController.registerSubscription')
    Route.post('/unregister', 'PushController.unregisterSubscription')
  })
  .prefix('push')
  .middleware('auth')
