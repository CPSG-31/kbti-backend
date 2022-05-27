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

Route.group(() => {
  Route.get('users', 'UsersController.index')
  Route.get('users/:id', 'UsersController.show')
  Route.delete('users/:id', 'UsersController.destroy')
}).middleware('auth')

Route.put('users/:id/role', 'UserRolesController.update').middleware('auth')

Route.get('roles', 'RolesController.index').middleware('auth')

Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.post('register', 'AuthController.register')
  Route.get('logout', 'AuthController.logout').middleware('auth')
})

Route.group(() => {
  Route.get('/definitions/:term', 'DefinitionsController.index')
  Route.post('/definitions', 'DefinitionsController.store').middleware('auth')
  Route.put('/definitions/:id', 'DefinitionsController.update').middleware('auth')
  Route.delete('/definitions/:id', 'DefinitionsController.destroy').middleware('auth')
})

Route.any('/*', async () => {
  return {
    code: 404,
    status: 'Not Found',
    message: 'Route not found',
  }
})
