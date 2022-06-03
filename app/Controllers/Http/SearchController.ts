import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Definition from 'App/Models/Definition'

export default class SearchController {
  public async index({ request, response }: HttpContextContract) {
    const { q } = request.qs()
    const formattedQuery = decodeURI(q).trim()

    if (!q) {
      return response.status(400).send({
        code: 400,
        status: 'Bad Request',
        message: 'Term or char are required',
      })
    }

    try {
      const terms = await this.getTerms(formattedQuery)

      if (!terms.length) {
        return response.status(404).send({
          code: 404,
          status: 'Not Found',
          message: 'No terms found',
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

  private getTerms(query) {
    const STATUS_DEFINITION_APPROVED = 2
    if (query.length === 1) {
      return query === '*'
        ? Definition.query()
            .distinct('term')
            .where('status_definition_id', STATUS_DEFINITION_APPROVED)
        : Definition.query()
            .where('term', 'like', `${query}%`)
            .distinct('term')
            .where('status_definition_id', STATUS_DEFINITION_APPROVED)
    }
    return Definition.query()
      .where('term', 'like', `%${query}%`)
      .distinct('term')
      .where('status_definition_id', STATUS_DEFINITION_APPROVED)
  }
}
