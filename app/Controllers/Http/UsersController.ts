import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { createResponse } from 'App/Helpers/Customs'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export default class UsersController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })
  protected LIMIT_PAGINATION = 10

  public async index({ request, response, bouncer }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    try {
      await bouncer.with('UserPolicy').authorize('getAllUsers')

      const usersPaginator: ModelPaginatorContract<User> = await User.query()
        .preload('role')
        .where('is_active', true)
        .paginate(page, this.LIMIT_PAGINATION)

      const { meta, data: users } = usersPaginator.serialize()

      if (!users.length) {
        throw new Error('Users not found')
      }

      this.res.meta = meta
      this.res.data = users.map((data) => {
        return {
          id: data.id,
          username: data.username,
          role_name: data.role.role_name,
          email: data.email,
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND' || error.message === 'Users not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Users not found'
      }

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async show({ params, response, bouncer }: HttpContextContract): Promise<void> {
    const { id: userId }: Record<string, number> = params
    try {
      await bouncer.with('UserPolicy').authorize('getUserById')

      const user: User = await User.query().preload('role').where('id', userId).firstOrFail()

      this.res.data = {
        id: user.id,
        role_id: user.roleId,
        role_name: user.role.roleName,
        username: user.username,
        email: user.email,
      }

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'User not found'
      }

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async destroy({ params, response, bouncer }: HttpContextContract): Promise<void> {
    const { id: userId }: Record<string, number> = params
    try {
      await bouncer.with('UserPolicy').authorize('deleteUserById')

      const user: User = await User.query()
        .where('id', userId)
        .whereNot('is_active', false)
        .firstOrFail()

      user.isActive = false

      await user.save()

      this.res.message = 'User deleted'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'User not found'
      }

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
