import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'

export default class DashboardUsersController {
  private STATUS_DEFINITION_REVIEW: number = 1
  private STATUS_DEFINITION_APPROVED: number = 2
  private STATUS_DEFINITION_REJECTED: number = 3
  private STATUS_DEFINITION_DELETED: number = 4

  public async index({ response, auth }: HttpContextContract): Promise<void> {
    const { id: userId, username, email } = auth.user!
    try {
      const definitions = await Definition.query()
        .preload('category')
        .preload('statusDefinition')
        .where('user_id', userId)
        .whereNot('status_definition_id', this.STATUS_DEFINITION_DELETED)
        .orderBy('updated_at', 'desc')

      const dataDefinitions = definitions.map((data) => {
        const { id, term, definition, category, statusDefinition, createdAt, updatedAt } = data
        return {
          id,
          term,
          definition,
          category: category.category,
          statusDefinition: statusDefinition.statusDefinition,
          createdAt: getUnixTimestamp(createdAt),
          updatedAt: getUnixTimestamp(updatedAt),
        }
      })

      const totaldefinitionApproved = await this.getTotalDefinition(
        userId,
        this.STATUS_DEFINITION_APPROVED
      )

      const totaldefinitionReview = await this.getTotalDefinition(
        userId,
        this.STATUS_DEFINITION_REVIEW
      )

      const totaldefinitionRejected = await this.getTotalDefinition(
        userId,
        this.STATUS_DEFINITION_REJECTED
      )

      return response.status(200).json({
        code: 200,
        status: 'Success',
        data: {
          userId,
          username,
          email,
          total_approved: totaldefinitionApproved.total,
          total_review: totaldefinitionReview.total,
          total_reject: totaldefinitionRejected.total,
          definitions: dataDefinitions,
        },
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  private async getTotalDefinition(userId: number, statusId: number) {
    return Database.from('definitions')
      .count('* as total')
      .where('user_id', userId)
      .where('status_definition_id', statusId)
      .first()
  }
}
