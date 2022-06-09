import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'

export default class UsersController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ response }: HttpContextContract): Promise<void> {
    try {
      const users: User[] = await User.query().preload('role')

      this.res.data = users.map((user) => {
        return {
          id: user.id,
          role_id: user.roleId,
          role_name: user.role.roleName,
          username: user.username,
          email: user.email,
          is_active: user.isActive,
          createad_at: getUnixTimestamp(user.createdAt),
          updated_at: getUnixTimestamp(user.updatedAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Users not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async show({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId }: Record<string, number> = params
    try {
      const user: User = await User.query().preload('role').where('id', userId).firstOrFail()

      this.res.data = {
        id: user.id,
        role_id: user.roleId,
        role_name: user.role.roleName,
        username: user.username,
        email: user.email,
        is_active: user.isActive,
        createad_at: getUnixTimestamp(user.createdAt),
        updated_at: getUnixTimestamp(user.updatedAt),
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

      return response.status(this.res.code).json(this.res)
    }
  }

  public async destroy({ params, response }: HttpContextContract): Promise<void> {
    const { id: userId }: Record<string, number> = params
    try {
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

      return response.status(this.res.code).json(this.res)
    }
  }
}
