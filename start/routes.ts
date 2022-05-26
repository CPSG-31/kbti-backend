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

Route.resource('users', 'UsersController')
  .except(['create', 'edit', 'store'])
  .middleware({
    index: ['auth'],
    show: ['auth'],
    update: ['auth'],
    destroy: ['auth'],
  })

Route.get('roles', 'RolesController.index').middleware('auth')
Route.post('login', 'AuthController.login')
Route.post('register', 'AuthController.register')
Route.get('dashboard', async ({ auth }) => {
  await auth.use('api').authenticate()
  console.log(auth.use('api'))
  return {
    code: 200,
    status: 'Success',
    message: 'User has been logged in',
  }
})

Route.get('/logout', async ({ auth }) => {
  await auth.use('api').revoke()
  return {
    revoked: true,
  }
})

Route.any('/*', async () => {
  return {
    code: 404,
    status: 'Not Found',
    message: 'Route not found',
  }
})
