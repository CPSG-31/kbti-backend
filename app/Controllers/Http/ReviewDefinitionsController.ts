import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'

export default class ReviewDefinitionsController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ response }: HttpContextContract): Promise<void> {
    const STATUS_DEFINITION_REVIEW: number = 1

    try {
      const definitions: Definition[] = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', STATUS_DEFINITION_REVIEW)

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

  public async update({ params, request, response }: HttpContextContract): Promise<void> {
    const STATUS_DEFINITION_REVIEW = 1
    const { id: definitionId }: Record<string, number> = params
    const { status_id: statusId }: Record<string, number> = request.all()

    this.res.message = 'Definition reviewed'

    try {
      const definition: Definition = await Definition.query()
        .where('id', definitionId)
        .where('status_definition_id', STATUS_DEFINITION_REVIEW)
        .firstOrFail()

      if (!definition) {
        throw new Error('Definition not found')
      }

      definition.statusDefinitionId = statusId
      await definition.save()

      return response.status(this.res.code).json(this.res)
    } catch (error) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      if (error instanceof Error && error.message === 'Definition not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
