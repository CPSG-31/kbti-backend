import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Definition from 'App/Models/Definition'
import { createResponse, getTotalDownVotes, getUnixTimestamp } from 'App/Helpers/Customs'
import StatusDefinitions from 'App/Enums/StatusDefinitions'

export default class TermsController {
  private LIMIT: number = 10
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async getNewlyAddedTerms({ response }: HttpContextContract): Promise<void> {
    try {
      const terms: Definition[] = await Definition.query()
        .distinct('term')
        .where('status_definition_id', StatusDefinitions.APPROVED)
        .orderBy('updated_at', 'desc')
        .limit(this.LIMIT)

      if (!terms.length) {
        throw new Error('Terms not found')
      }

      this.res.data = terms

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = 'Internal Server Error'

      if (error.message === 'Terms not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }

  public async getRandomDefinitions({ response }: HttpContextContract): Promise<void> {
    try {
      const definitions: Definition[] = await Definition.query()
        .withCount('vote', (query) => {
          query.as('total_votes')
        })
        .withAggregate('vote', (query) => {
          query.sum('is_upvote').as('total_up_votes')
        })
        .preload('user')
        .preload('category')
        .where('status_definition_id', StatusDefinitions.APPROVED)
        .groupBy('term')
        .orderByRaw('RAND()')
        .limit(this.LIMIT)

      if (!definitions.length) {
        throw new Error('Defintions not found')
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
          updatedAt,
        } = data

        return {
          id,
          term,
          definition,
          category: category.category,
          username: user.username,
          up_votes: totalUpVotes || 0,
          down_votes: getTotalDownVotes(totalVotes, totalUpVotes),
          created_at: getUnixTimestamp(createdAt),
          updated_at: getUnixTimestamp(updatedAt),
        }
      })

      return response.status(this.res.code).json(this.res)
    } catch (error: any) {
      this.res.code = 500
      this.res.status = 'Error'
      this.res.message = error

      if (error instanceof Error && error.message === 'Definitions not found') {
        this.res.code = 404
        this.res.status = 'Not Found'
        this.res.message = error.message
      }

      return response.status(this.res.code).json(this.res)
    }
  }
}
