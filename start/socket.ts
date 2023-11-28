/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('MessageController.onConnected')
  .on('channel_message', 'MessageController.postMessage')
  .on('user_typing', 'MessageController.updateTyping')
