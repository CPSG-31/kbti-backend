import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse } from 'App/Helpers/Customs'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import UpdateRoleValidator from 'App/Validators/UpdateRoleValidator'

export default class UserRolesController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async update({ request, params, response, bouncer }: HttpContextContract): Promise<void> {
    try {
      await bouncer.with('UserRolePolicy').authorize('updateUserRole')

      const userId: number = params.id
      const { role_id: roleId }: { role_id: number } = await request.validate(UpdateRoleValidator)

      const user: User = await User.query()
        .preload('role')
        .where('id', userId)
        .where('is_active', true)
        .firstOrFail()

      const role: Role = await Role.findOrFail(roleId)

      user.roleId = role.id

      await user.save()

      this.res.message = 'User role updated'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_VALIDATION_FAILURE') {
        this.res.code = 422
        this.res.status = 'Validation Error'
        this.res.message = error.messages
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'User or role not found'
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
