import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password } = request.all()
      const user = await User.findBy('email', email)
      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '5mins',
      })
      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: {
          user_id: user?.id,
          role_id: user?.roleId || 2,
          username: email?.username,
          email: email,
          token,
        },
      })
    } catch (error) {
      return response.status(401).json({ error: error.message })
    }
  }

  public async register({ request, response }: HttpContextContract) {
    const defaultRoleId = 2

    try {
      const payload = await request.validate(CreateUser)
      const validData = {
        ...payload,
        roleId: defaultRoleId,
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
}
