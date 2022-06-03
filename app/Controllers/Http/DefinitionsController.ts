import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import User from 'App/Models/User'
import CreateDefinitionValidator from 'App/Validators/CreateDefinitionValidator'
import { DateTime } from 'luxon'

export default class DefinitionsController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ request, response }: HttpContextContract): Promise<void> {
    const STATUS_DEFINITION_APPROVED: number = 2

    const { term, categoryId }: Record<string, string> = request.qs()
    const formattedTerm: string = decodeURI(term).trim()

    if (!term && !categoryId) {
      this.res.code = 422
      this.res.status = 'Validation Error'
      this.res.message = 'Term or categoryId is required'
      return response.status(this.res.code).json(this.res)
    }

    try {
      const definitions: Definition[] = term
        ? await Definition.query()
            .preload('user')
            .preload('category')
            .where('status_definition_id', STATUS_DEFINITION_APPROVED)
            .where('term', 'like', `%${formattedTerm}%`)
        : await Definition.query()
            .preload('user')
            .preload('category')
            .where('status_definition_id', STATUS_DEFINITION_APPROVED)
            .where('categoryId', categoryId)

      if (!definitions.length) {
        throw new Error('Definitions not found')
      }

      this.res.data = definitions.map((data) => {
        const { id, term, definition, user, category, createdAt }: Definition = data

        return {
          id,
          term,
          definition,
          category: category.category,
          username: user.username,
          created_at: getUnixTimestamp(createdAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
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

  public async show({ params, response }: HttpContextContract): Promise<void> {
    const STATUS_DEFINITION_DELETED: number = 4
    const { id: definitionId }: number = params

    try {
      const data: Definition = await Definition.query()
        .where('id', definitionId)
        .whereNot('status_definition_id', STATUS_DEFINITION_DELETED)
        .preload('user')
        .preload('category')
        .firstOrFail()

      if (!data) {
        throw new Error('Definition not found')
      }
      
      const { id, term, definition, user, category, createdAt }: Definition = data
      this.res.data = {
        id,
        term,
        definition,
        category: category,
        username: user.username,
        created_at: getUnixTimestamp(createdAt),
      }
      
      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.message === 'Definition not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async store({ request, response, auth }: HttpContextContract): Promise<void> {
    const DEFAULT_STATUS_DEFINITION_ID: number = 1
    const { id: userId }: User = auth.user!
    try {
      const payload: Object = await request.validate(CreateDefinitionValidator)
      const validData: Object = {
        userId,
        ...payload,
        statusDefinitionId: DEFAULT_STATUS_DEFINITION_ID,
      }

      await Definition.create(validData)

      this.res.code = 201
      this.res.message = 'Definition created'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_VALIDATION_FAILURE') {
        this.res.code = 422
        this.res.status = 'Validation Error'
        this.res.message = error.messages
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract): Promise<void> {
    const { id: userId }: User = auth.user!
    const { id }: Record<string, number> = params
    const DEFAULT_STATUS_DEFINITION_ID: number = 1
    try {
      const payload: Object = await request.validate(CreateDefinitionValidator)

      await Definition.findOrFail(id)

      await Definition.updateOrCreate(
        { id },
        {
          userId,
          ...payload,
          statusDefinitionId: DEFAULT_STATUS_DEFINITION_ID,
        }
      )
      this.res.message = 'Definition updated'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_VALIDATION_FAILURE') {
        this.res.code = 422
        this.res.status = 'Validation Error'
        this.res.message = error.messages
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definition not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async destroy({ params, response }: HttpContextContract): Promise<void> {
    const STATUS_DEFINITION_DELETED: number = 4
    const { id }: Record<string, number> = params

    try {
      const definition: Definition = await Definition.findOrFail(id)

      definition.statusDefinitionId = STATUS_DEFINITION_DELETED
      definition.deletedAt = DateTime.local()
      await definition.save()

      this.res.message = 'Definition deleted'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definition not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
