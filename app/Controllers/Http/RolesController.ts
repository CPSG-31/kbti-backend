import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse } from 'App/Helpers/Customs'
import Role from 'App/Models/Role'

export default class RolesController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ response }: HttpContextContract): Promise<void> {
    try {
      const roles: Role[] = await Role.all()
      this.res.data = roles

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      return response.status(this.res.code).json(this.res)
    }
  }
}
