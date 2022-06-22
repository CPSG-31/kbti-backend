import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StatusDefinitions from 'App/Enums/StatusDefinitions'
import { createResponse, getTotalDownVotes } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import Vote from 'App/Models/Vote'
import VoteValidator from 'App/Validators/VoteValidator'

export default class VotesController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async store({ params, response, request, auth }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, any> = params
    const { id: userId }: { id: number } = auth.user!
    let isVoted

    try {
      const { is_upvote: isUpvote }: { is_upvote: boolean } = await request.validate(VoteValidator)

      await Definition.findOrFail(definitionId)
      const currVote: Vote | null = await Vote.query()
        .where('user_id', userId)
        .where('definition_id', definitionId)
        .first()

      if (currVote !== null && !!currVote?.isUpvote !== isUpvote) {
        await currVote.delete()
        isVoted = false
      } else {
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
        isVoted = true
      }

      const definition = await Definition.query()
        .withCount('vote', (query) => {
          query.as('total_votes')
        })
        .withAggregate('vote', (query) => {
          query.sum('is_upvote').as('total_up_votes')
        })
        .where('id', definitionId)
        .where('status_definition_id', StatusDefinitions.APPROVED)
        .firstOrFail()

      const { id, totalVotes, totalUpVotes }: Definition = definition
      const vote = {
        vote_id: id,
        is_voted: isVoted,
        up_votes: totalUpVotes || 0,
        down_votes: getTotalDownVotes(totalVotes, totalUpVotes),
      }

      this.res.message = 'Definition voted'
      this.res.data = vote

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = error.message

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
}
