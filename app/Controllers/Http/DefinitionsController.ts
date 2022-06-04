import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import User from 'App/Models/User'
import CreateDefinitionValidator from 'App/Validators/CreateDefinitionValidator'
import { DateTime } from 'luxon'

export default class DefinitionsController {
  protected STATUS_DEFINITION_DEFAULT: number = 1
  protected STATUS_DEFINITION_APPROVED: number = 2
  protected STATUS_DEFINITION_DELETED: number = 4
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ request, response }: HttpContextContract): Promise<void> {
    const { term, categoryId }: Record<string, any> = request.qs()
    const formattedTerm: string = decodeURI(term).trim()

    if (!term && !categoryId) {
      this.res.code = 422
      this.res.status = 'Validation Error'
      this.res.message = 'Term or categoryId is required'
      return response.status(this.res.code).json(this.res)
    }

    try {
      const definitions: Definition[] = term
        ? await this.getDefinitionsByTerm(formattedTerm)
        : await this.getDefinitionsByCategory(categoryId)

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
          totalVotes,
          totalUpVotes,
          createdAt,
        }: Definition = data

        return {
          id,
          term,
          definition,
          category: category.category,
          username: user.username,
          total_votes: totalVotes,
          up_votes: totalUpVotes || 0,
          created_at: getUnixTimestamp(createdAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.message === 'Definitions not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async show({ params, response, auth }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, number> = params
    const { username }: User = auth.user!

    try {
      const data: Definition = await this.getDefinitionById(definitionId)

      const {
        id,
        term,
        definition,
        category,
        totalVotes,
        totalUpVotes,
        createdAt,
        updatedAt,
      }: Definition = data

      this.res.data = {
        id,
        term,
        definition,
        category: category.category,
        username: username,
        total_votes: totalVotes,
        up_votes: totalUpVotes || 0,
        created_at: getUnixTimestamp(createdAt),
        updated_at: getUnixTimestamp(updatedAt),
      }

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

  public async store({ request, response, auth }: HttpContextContract): Promise<void> {
    const { id: userId }: User = auth.user!
    try {
      const payload: Object = await request.validate(CreateDefinitionValidator)
      const validData: Object = {
        userId,
        ...payload,
        statusDefinitionId: this.STATUS_DEFINITION_DEFAULT,
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
    try {
      const payload: Object = await request.validate(CreateDefinitionValidator)

      await Definition.findOrFail(id)

      await Definition.updateOrCreate(
        { id },
        {
          userId,
          ...payload,
          statusDefinitionId: this.STATUS_DEFINITION_DEFAULT,
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
    const { id }: Record<string, number> = params

    try {
      const definition: Definition = await Definition.findOrFail(id)

      definition.statusDefinitionId = this.STATUS_DEFINITION_DELETED
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

  private getDefinitionsByCategory(categoryId: number): Promise<Definition[]> {
    return Definition.query()
      .withCount('vote', (query) => {
        query.as('total_votes')
      })
      .withAggregate('vote', (query) => {
        query.sum('is_upvote').as('total_up_votes')
      })
      .preload('user', (userQuery) => {
        userQuery.select('username')
      })
      .preload('category')
      .where('status_definition_id', this.STATUS_DEFINITION_APPROVED)
      .where('categoryId', categoryId)
  }

  private getDefinitionsByTerm(term: string): Promise<Definition[]> {
    return Definition.query()
      .withCount('vote', (query) => {
        query.as('total_votes')
      })
      .withAggregate('vote', (query) => {
        query.sum('is_upvote').as('total_up_votes')
      })
      .preload('user', (userQuery) => {
        userQuery.select('username')
      })
      .preload('category')
      .where('status_definition_id', this.STATUS_DEFINITION_APPROVED)
      .where('term', 'like', `%${term}%`)
  }

  private getDefinitionById(id: number): Promise<Definition> {
    return Definition.query()
      .withCount('vote', (query) => {
        query.as('total_votes')
      })
      .withAggregate('vote', (query) => {
        query.sum('is_upvote').as('total_up_votes')
      })
      .preload('category')
      .where('id', id)
      .whereNot('status_definition_id', this.STATUS_DEFINITION_DELETED)
      .firstOrFail()
  }
}
