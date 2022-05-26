import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { getUnixTimestamp } from 'App/Helpers/Customs'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const users = await User.query().preload('role')
      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: users.map((user) => {
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
        }),
      })
    } catch (error) {
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const user = await User.query().preload('role').where('id', params.id).firstOrFail()

      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: {
          id: user.id,
          role_id: user.roleId,
          role_name: user.role.roleName,
          username: user.username,
          email: user.email,
          is_active: user.isActive,
          createad_at: getUnixTimestamp(user.createdAt),
          updated_at: getUnixTimestamp(user.updatedAt),
        },
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          code: 404,
          status: 'Error',
          message: 'User not found',
        })
      }
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const user = await User.query().where('id', params.id).firstOrFail()

      user.isActive = false
      await user.save()
      return response.json({
        code: 200,
        status: 'Success',
        message: 'User has been deleted',
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).send({
          code: 404,
          status: 'Error',
          message: 'User not found',
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
