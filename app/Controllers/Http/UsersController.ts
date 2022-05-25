import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateRoleValidator from 'App/Validators/UpdateRoleValidator'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const users = await User.query().preload('role').where('isActive', true)
      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: users,
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
      const user = await User.query()
        .where('id', params.id)
        .preload('role')
        .where('is_active', true)
        .firstOrFail()
      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: user,
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

  public async store({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateUser)
      const validData = {
        ...payload,
        roleId: 2,
        isActive: true,
      }
      const user = await User.create(validData)
      return response.status(201).json({
        code: 201,
        status: 'Success',
        data: user,
      })
    } catch (error) {
      if (error.name === 'ValidationException') {
        return response.status(422).send({
          code: 422,
          status: 'Error',
          messages: error.messages,
        })
      }
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }

  public async update({ request, params, response }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateRoleValidator)
      const user = await User.query().where('id', params.id).where('is_active', true).firstOrFail()
      const role = await Role.query().where('id', payload.roleId).firstOrFail()

      user.roleId = role.id
      await user.save()

      return response.json({
        code: 200,
        status: 'Success Update Role',
        data: user,
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
          message: 'Data not found',
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
