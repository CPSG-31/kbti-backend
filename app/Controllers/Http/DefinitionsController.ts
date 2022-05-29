import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import CreateDefinitionValidator from 'App/Validators/CreateDefinitionValidator'
import { DateTime } from 'luxon'

export default class DefinitionsController {
  public async index({ request, response }: HttpContextContract) {
    const STATUS_DEFINITION_APPROVED = 2

    const { term, categoryId } = request.qs()
    const formattedTerm = decodeURI(term).trim()

    if (!term && !categoryId) {
      return response.status(422).send({
        code: 422,
        status: 'Error',
        message: 'Term or categoryId is required',
      })
    }

    try {
      const definitions = term
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
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Term not found',
        })
      }

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Definitions found',
        data: definitions.map((data) => {
          const { id, term, definition, user, category, createdAt } = data

          return {
            id,
            term,
            definition,
            category: category.category,
            username: user.username,
            created_at: getUnixTimestamp(createdAt),
          }
        }),
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const DEFAULT_STATUS_DEFINITION_ID = 1

    try {
      const payload = await request.validate(CreateDefinitionValidator)
      const validData = {
        ...payload,
        statusDefinitionId: DEFAULT_STATUS_DEFINITION_ID,
      }
      await Definition.create(validData)

      return response.status(201).json({
        code: 200,
        status: 'Success',
        message: 'Definition created',
      })
    } catch (error) {
      if (error.name === 'ValidationException') {
        return response.status(422).send({
          code: 422,
          status: 'Error',
          messages: error.messages,
        })
      }
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    const DEFAULT_STATUS_DEFINITION_ID = 1
    try {
      const payload = await request.validate(CreateDefinitionValidator)

      const definition = await Definition.findOrFail(id)
      if (!definition) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Definition not found',
        })
      }

      const validData = {
        ...payload,
        statusDefinitionId: DEFAULT_STATUS_DEFINITION_ID,
      }

      definition.merge(validData)
      await definition.save()

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Definition updated',
      })
    } catch (error) {
      if (error.name === 'ValidationException') {
        return response.status(422).send({
          code: 422,
          status: 'Error',
          messages: error.messages,
        })
      }
      return response.status(500).send({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    const STATUS_DEFINITION_DELETED = 4
    try {
      const definition = await Definition.findByOrFail('id', id)
      if (!definition) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Definition not found',
        })
      }

      definition.statusDefinitionId = STATUS_DEFINITION_DELETED
      definition.deletedAt = DateTime.local()
      await definition.save()

      return response.status(200).json({
        code: 200,
        status: 'Success',
        message: 'Definition deleted',
      })
    } catch (error) {
      return response.status(500).json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }
}
