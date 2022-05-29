import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'

export default class CategoriesController {
  public async index({ response }: HttpContextContract) {
    try {
      const categories = await Category.query()

      if (!categories.length) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Categories not found',
        })
      }

      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: categories,
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: error.message,
      })
    }
  }
}
