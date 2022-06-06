import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'

export default class ManageDefinitionsController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ response }: HttpContextContract): Promise<void> {
    try {
      const definitions: Definition[] = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.APPROVED)
        .orWhere('status_definition_id', StatusDefinitions.REJECTED)

      if (!definitions.length) {
        throw new Error('Definitions not found')
      }

      this.res.data = definitions.map((data) => {
        const {
          id,
          term,
          definition,
          user,
          category,
          statusDefinition,
          createdAt,
          updatedAt,
        }: Definition = data

        return {
          id,
          term,
          definition,
          category: category.category,
          username: user.username,
          status: statusDefinition.statusDefinition,
          created_at: getUnixTimestamp(createdAt),
          updated_at: getUnixTimestamp(updatedAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      if (error instanceof Error && error.message === 'Definitions not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
