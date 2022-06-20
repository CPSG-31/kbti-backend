import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse, getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import StatusDefinitions from 'App/Enums/StatusDefinitions'
import Roles from 'App/Enums/Roles'
import ReviewDefinitionValidator from 'App/Validators/ReviewDefinitionValidator'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ManageDefinitionsController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })
  protected LIMIT_PAGINATION = 10

  public async index({ request, response, bouncer }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)

    try {
      await bouncer.with('ManageDefinitionPolicy').authorize('getDefinitions')

      const definitionsPaginator: ModelPaginatorContract<Definition> = await Definition.query()
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.APPROVED)
        .orWhere('status_definition_id', StatusDefinitions.REJECTED)
        .orderBy('updated_at', 'desc')
        .paginate(page, this.LIMIT_PAGINATION)

      const { meta, data: definitions } = definitionsPaginator.serialize()

      if (!definitions.length) {
        throw new Error('Definitions not found')
      }

      this.res.meta = meta
      this.res.data = definitions.map((data) => {
        return {
          id: data.id,
          term: data.term,
          definition: data.definition,
          status: data.statusDefinition.status_definition,
          created_at: getUnixTimestamp(data.created_at),
          updated_at: getUnixTimestamp(data.updated_at),
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

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getReviewedDefinitions({
    request,
    response,
    bouncer,
  }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)
    try {
      await bouncer.with('ManageDefinitionPolicy').authorize('getReviewedDefinitions')

      const definitionsPaginator: ModelPaginatorContract<Definition> = await Definition.query()
        .preload('user')
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.REVIEW)
        .orderBy('updated_at', 'desc')
        .paginate(page, this.LIMIT_PAGINATION)

      const { meta, data: definitions } = definitionsPaginator.serialize()

      if (!definitions.length) {
        throw new Error('Definitions not found')
      }

      this.res.meta = meta
      this.res.data = definitions.map((data) => {
        return {
          id: data.id,
          term: data.term,
          definition: data.definition,
          username: data.user.username,
          created_at: getUnixTimestamp(data.created_at),
          updated_at: getUnixTimestamp(data.updated_at),
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

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async reviewDefinitions({
    params,
    request,
    response,
    bouncer,
  }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, number> = params
    const { status_definition_id: statusDefinitionId }: { status_definition_id: number } =
      await request.validate(ReviewDefinitionValidator)

    try {
      await bouncer.with('ManageDefinitionPolicy').authorize('reviewDefinition')

      const definition: Definition = await Definition.query()
        .where('id', definitionId)
        .where('status_definition_id', StatusDefinitions.REVIEW)
        .firstOrFail()

      definition.statusDefinitionId = statusDefinitionId

      await definition.save()

      this.res.message = 'Definition reviewed'

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = error.message
      console.log(error.message)
      if (error.code === 'E_ROW_NOT_FOUND') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definitions not found'
      }

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getDeletedDefinitions({
    request,
    response,
    bouncer,
  }: HttpContextContract): Promise<void> {
    const page = request.input('page', 1)

    try {
      await bouncer.with('ManageDefinitionPolicy').authorize('getDeletedDefinitions')

      const definitionsPaginator: ModelPaginatorContract<Definition> = await Definition.query()
        .preload('user')
        .preload('category')
        .preload('statusDefinition')
        .where('status_definition_id', StatusDefinitions.DELETED)
        .orderBy('deleted_at', 'desc')
        .paginate(page, this.LIMIT_PAGINATION)

      const { meta, data: definitions } = definitionsPaginator.serialize()

      if (!definitions.length) {
        throw new Error('Definitions not found')
      }

      this.res.meta = meta
      this.res.data = definitions.map((data) => {
        return {
          id: data.id,
          term: data.term,
          definition: data.definition,
          username: data.user.username,
          created_at: getUnixTimestamp(data.created_at),
          updated_at: getUnixTimestamp(data.updated_at),
          deleted_at: getUnixTimestamp(data.deleted_at),
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

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async destroy({ params, response, bouncer }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, number> = params

    try {
      await bouncer.with('ManageDefinitionPolicy').authorize('deleteDefinition')

      const definition: Definition = await Definition.query()
        .where('id', definitionId)
        .where('status_definition_id', StatusDefinitions.DELETED)
        .firstOrFail()

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

      if (error.code === 'E_AUTHORIZATION_FAILURE') {
        this.res.code = 403
        this.res.status = 'Forbidden'
        this.res.message = "You can't perform this action"
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async statistics({ response }: HttpContextContract): Promise<void> {
    try {
      const totaldefinitionReview: any = await this.getTotalDefinition(StatusDefinitions.REVIEW)

      const totaldefinitionApproved: any = await this.getTotalDefinition(StatusDefinitions.APPROVED)

      const totaldefinitionRejected: any = await this.getTotalDefinition(StatusDefinitions.REJECTED)

      const totaldefinitionDeleted: any = await this.getTotalDefinition(StatusDefinitions.DELETED)

      const totalUsers: any = await this.getTotalUser(Roles.USER)

      const totalAdmin: any = await this.getTotalUser(Roles.ADMIN)

      this.res.data = {
        definition_review: totaldefinitionReview?.total,
        definition_approved: totaldefinitionApproved?.total,
        definition_rejected: totaldefinitionRejected?.total,
        definition_deleted: totaldefinitionDeleted?.total,
        users: totalUsers?.total,
        admin: totalAdmin?.total,
      }

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal server error'

      return response.status(this.res.code).json(this.res)
    }
  }

  private async getTotalDefinition(statusId: number): Promise<any> {
    return Database.from('definitions')
      .count('* as total')
      .where('status_definition_id', statusId)
      .first()
  }

  private async getTotalUser(roleId: number): Promise<any> {
    return Database.from('users')
      .count('* as total')
      .where('is_active', true)
      .andWhere('role_id', roleId)
      .first()
  }
}
