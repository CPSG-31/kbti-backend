import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse } from 'App/Helpers/Customs'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'

export default class AuthController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async login({ request, response, auth }: HttpContextContract): Promise<void> {
    try {
      const { email, password }: Record<string, string> = request.all()
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const user: User = await User.findByOrFail('email', email)
      const token: OpaqueTokenContract<User> = await auth.use('api').attempt(email, password, {
        expiresIn: '2hours',
      })

      this.res.data = {
        user_id: user?.id,
        role_id: user?.roleId || Roles.USER,
        username: user?.username,
        email: email,
        access_token: token,
      }

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.message === 'Email and password are required') {
        this.res.code = 422
        this.res.status = 'Validation Error'
        this.res.message = error.message
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Email or password is incorrect'
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async register({ request, response }: HttpContextContract): Promise<void> {
    try {
      const payload: Object = await request.validate(CreateUser)

      const validData: Object = {
        ...payload,
        roleId: Roles.USER,
        isActive: true,
      }

      const user: User = await User.create(validData)
      this.res.code = 201
      this.res.data = user

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

      return response.status(this.res.code).json(this.res)
    }
  }

  public async logout({ auth, response }: HttpContextContract): Promise<void> {
    try {
      await auth.use('api').revoke()
      this.res.message = 'User has been logged out'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      return response.status(this.res.code).json(this.res)
    }
  }
}
