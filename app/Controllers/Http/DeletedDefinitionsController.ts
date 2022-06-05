import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'

export default class DeletedDefinitionsController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })
  protected STATUS_DEFINITION_DELETED: number = 4

  public async index({ response }: HttpContextContract): Promise<void> {
    try {
      const definitions: Definition[] = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', this.STATUS_DEFINITION_DELETED)

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
          deletedAt,
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
          deleted_at: getUnixTimestamp(deletedAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      if (error.message === 'Definitions not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async destroy({ params, response }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, number> = params

    try {
      const definition: Definition = await Definition.query()
        .where('id', definitionId)
        .where('status_definition_id', this.STATUS_DEFINITION_DELETED)
        .firstOrFail()

      if (!definition) {
        throw new Error('Definition not found')
      }

      await definition.delete()
      this.res.message = 'Definition deleted'
      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      if (error.message === 'Definition not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
