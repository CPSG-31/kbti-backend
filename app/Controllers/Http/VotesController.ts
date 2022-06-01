import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { createResponse } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import Vote from 'App/Models/Vote'
import VoteValidator from 'App/Validators/VoteValidator'

export default class VotesController {
  public async index({ params, response }: HttpContextContract): Promise<void> {
    const res: ResponseInterface = createResponse({ code: 200, status: 'Success' })
    try {
      const definition: Definition | null = await Definition.find(params.id)
      if (!definition) {
        throw new Error('Definition not found')
      }

      const query: string = `
        SELECT
          COUNT(is_upvote) as total_votes,
          SUM(
            CASE
              WHEN is_upvote = true THEN 1 ELSE 0
            END
          ) as total_up_votes
        FROM votes
        WHERE definition_id = :definitionId
      `

      const result: any = await Database.rawQuery(query, { definitionId: params.id })
      const votes: VotesInterface = result[0][0]

      res.data = {
        definition_id: +params.id,
        total_votes: votes.total_votes || 0,
        up_votes: votes.total_up_votes || 0,
      }

      return response.status(res.code).json(res)
    } catch (error) {
      res.code = 500
      res.message = 'Internal Server Error'

      if (error instanceof Error && error.message === 'Definition not found') {
        res.code = 404
        res.status = 'Not Found'
        res.message = error.message
      }

      return response.status(res.code).json(res)
    }
  }

  public async store({ params, response, request, auth }: HttpContextContract): Promise<void> {
    const { id: definitionId } = params
    const { id: userId } = auth.user!
    const { is_upvote: isUpvote }: { is_upvote: boolean } = await request.validate(VoteValidator)
    const res = createResponse({ code: 201, status: 'Success', message: 'Definition is voted' })

    try {
      const definition: Definition | null = await Definition.find(definitionId)
      if (!definition) {
        throw new Error('Definition not found')
      }

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

      return response.status(res.code).json(res)
    } catch (error) {
      res.code = 500
      res.status = 'Error'
      res.message = 'Internal Server Error'

      if (error instanceof Error && error.message === 'Definition not found') {
        res.code = 404
        res.status = 'Not Found'
        res.message = error.message
      }

      return response.status(res.code).json(res)
    }
  }
}
