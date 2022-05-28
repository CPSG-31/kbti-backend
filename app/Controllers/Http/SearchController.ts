import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Definition from 'App/Models/Definition'

export default class SearchController {
  public async index({ request, response }: HttpContextContract) {
    const { char, term } = request.qs()
    const formattedTerm = decodeURI(term).trim()

    if (!char || !formattedTerm) {
      return response.status(400).send({
        code: 400,
        status: 'Bad Request',
        message: 'Term or char are required',
      })
    }

    try {
      const QUERY_CHAR = await Definition.query().where('term', 'like', `${char}%`).distinct('term')
      const QUERY_TERM = await Definition.query()
        .where('term', 'like', `%${formattedTerm}%`)
        .distinct('term')

      const terms = char ? QUERY_CHAR : QUERY_TERM

      if (terms.length === 0) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Term not found',
        })
      }

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Term found',
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
}
