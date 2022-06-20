import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import Roles from 'App/Enums/Roles'

export default class AuthController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async login({ request, response, auth }: HttpContextContract): Promise<void> {
    try {
      const { email, password }: Record<string, string> = request.all()
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const user: User = await User.query()
        .where('email', email)
        .where('isActive', true)
        .firstOrFail()

      const apiToken: OpaqueTokenContract<User> = await auth.use('api').attempt(email, password, {
        expiresIn: '24hours',
      })

      const { type, token, expiresAt } = apiToken

      this.res.data = {
        user_id: user?.id,
        role_id: user?.roleId || Roles.USER,
        username: user?.username,
        email: email,
        access_token: {
          type: type.toLowerCase(),
          token: token,
          expires_at: getUnixTimestamp(expiresAt!),
        },
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

      if (error.code === 'E_ROW_NOT_FOUND' || error.code === 'E_INVALID_AUTH_PASSWORD') {
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
      await auth.use('api').logout()
      this.res.message = 'User has been logged out'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getTokenInfo({ request, response, auth }: HttpContextContract): Promise<void> {
    try {
      const authorization = request.headers().authorization!
      const [authType, authToken] = authorization.split(' ')

      const user = auth.use('api').user!
      const { expiresAt } = auth.use('api').token!

      this.res.data = {
        user_id: user.id,
        role_id: user.roleId,
        username: user.username,
        email: user.email,
        access_token: {
          type: authType.toLowerCase(),
          token: authToken,
          expires_at: getUnixTimestamp(expiresAt!),
        },
      }

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Data not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
