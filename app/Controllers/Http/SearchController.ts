import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'
import { createResponse } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'

export default class SearchController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ request, response }: HttpContextContract): Promise<void> {
    const { q }: any = request.qs()
    const formattedQuery: string = decodeURI(q).trim()

    if (!q) {
      this.res.code = 422
      this.res.status = 'Validation Error'
      this.res.message = 'Term or char are required'
      return response.status(this.res.code).json(this.res)
    }

    try {
      const terms: Definition[] = await this.getTerms(formattedQuery)

      if (!terms.length) {
        throw new Error('Terms not found')
      }

      this.res.data = terms

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      if (error instanceof Error && error.message === 'Terms not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  private getTerms(query: string): ModelQueryBuilderContract<typeof Definition, Definition> {
    const STATUS_DEFINITION_APPROVED: number = 2
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
