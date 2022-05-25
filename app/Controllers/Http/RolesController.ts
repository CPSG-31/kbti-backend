import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'

export default class RolesController {
  public async index({ response }: HttpContextContract) {
    try {
      const roles = await Role.all()
      return response.json({
        code: 200,
        status: 'Success',
        data: roles,
      })
    } catch (error) {
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }
}
