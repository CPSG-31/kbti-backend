import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Definition from 'App/Models/Definition'
import { getUnixTimestamp } from 'App/Helpers/Customs'

export default class TermsController {
  private LIMIT = 10
  private STATUS_APPROVED_ID = 2

  public async getNewlyAddedTerms({ response }: HttpContextContract) {
    try {
      const terms = await Definition.query()
        .distinct('term')
        .where('status_definition_id', this.STATUS_APPROVED_ID)
        .orderBy('updated_at', 'desc')
        .limit(this.LIMIT)

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Terms found',
        data: terms,
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  public async getRandomDefinitions({ response }: HttpContextContract) {
    try {
      const definitions = await Definition.query()
        .preload('user')
        .preload('category')
        .where('status_definition_id', this.STATUS_APPROVED_ID)
        .groupBy('term')
        .orderByRaw('RAND()')
        .limit(this.LIMIT)

      if (!definitions.length) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Terms not found',
        })
      }

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Definitions found',
        data: definitions.map((data) => {
          const { id, term, definition, user, category, createdAt, updatedAt } = data

          return {
            id,
            term,
            definition,
            category: category.category,
            username: user.username,
            created_at: getUnixTimestamp(createdAt),
            updated_at: getUnixTimestamp(updatedAt),
          }
        }),
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
        data: error.message,
      })
    }
  }
}
