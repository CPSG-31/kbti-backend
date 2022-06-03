import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import UpdateRoleValidator from 'App/Validators/UpdateRoleValidator'

export default class UserRolesController {
  public async update({ request, params, response }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateRoleValidator)
      const user = await User.query()
        .preload('role')
        .where('id', params.id)
        .where('is_active', true)
        .firstOrFail()
      const role = await Role.query().where('id', payload.role_id).firstOrFail()

      user.roleId = role.id
      await user.save()

      return response.json({
        code: 200,
        status: 'Success Update Role',
        message: 'Role has been updated',
      })
    } catch (error) {
      if (error.name === 'ValidationException') {
        return response.status(422).send({
          code: 422,
          status: 'Error',
          messages: error.messages,
        })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          code: 404,
          status: 'Error',
          message: 'User or role not found',
        })
      }
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }
}
