import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import Vote from 'App/Models/Vote'
import VoteValidator from 'App/Validators/VoteValidator'

export default class VotesController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async index({ params, response }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, any> = params

    try {
      await Definition.findOrFail(definitionId)

      const result: Vote = await Vote.query()
        .count('is_upvote as total_votes')
        .sum('is_upvote as total_up_votes')
        .where('definition_id', definitionId)
        .firstOrFail()

      const votes: VotesInterface = {
        total_votes: result.$extras.total_votes || 0,
        total_up_votes: result.$extras.total_up_votes || 0,
      }

      this.res.data = {
        definition_id: +definitionId,
        total_votes: votes.total_votes || 0,
        up_votes: votes.total_up_votes || 0,
      }

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

  public async store({ params, response, request, auth }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, any> = params
    const { id: userId }: { id: number } = auth.user!
    const { is_upvote: isUpvote }: { is_upvote: boolean } = await request.validate(VoteValidator)

    this.res.code = 201
    this.res.message = 'Definition voted'

    try {
      await Definition.findOrFail(definitionId)

      await Vote.updateOrCreate(
        {
          userId,
          definitionId,
        },
        {
          userId,
          definitionId,
          isUpvote,
        }
      )

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error instanceof Error && error.message === 'E_ROW_NOT_FOUND: Row not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = 'Definition not found'
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
