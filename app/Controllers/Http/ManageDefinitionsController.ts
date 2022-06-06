import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import StatusDefinitions from 'App/Enums/StatusDefinitions'

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
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = error.message

      if (error.message === 'Definitions not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getReviewedDefinitions({ response }: HttpContextContract): Promise<void> {
    try {
      const definitions: Definition[] = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.REVIEW)

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

  public async reviewDefinitions({
    params,
    request,
    response,
  }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, number> = params
    const { status_definition_id: statusDefinitionId }: Record<string, number> = request.only([
      'status_definition_id',
    ])

    try {
      const definition: Definition = await Definition.query()
        .where('id', definitionId)
        .where('status_definition_id', StatusDefinitions.REVIEW)
        .firstOrFail()

      definition.statusDefinitionId = statusDefinitionId
      console.log(statusDefinitionId)
      await definition.save()

      this.res.message = 'Definition reviewed'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = error.message

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definitions not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getDeletedDefinitions({ response }: HttpContextContract): Promise<void> {
    try {
      const definitions: Definition[] = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.DELETED)

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
        .where('status_definition_id', StatusDefinitions.DELETED)
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

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definitions not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
