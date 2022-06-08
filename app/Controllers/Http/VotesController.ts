import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createResponse } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import Vote from 'App/Models/Vote'
import VoteValidator from 'App/Validators/VoteValidator'

export default class VotesController {
  protected res: ResponseInterface = createResponse({ code: 200, status: 'Success' })

  public async store({ params, response, request, auth }: HttpContextContract): Promise<void> {
    const { id: definitionId }: Record<string, any> = params
    const { id: userId }: { id: number } = auth.user!

    try {
      const { is_upvote: isUpvote }: { is_upvote: boolean } = await request.validate(VoteValidator)

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

      this.res.code = 201
      this.res.message = 'Definition voted'

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
}
