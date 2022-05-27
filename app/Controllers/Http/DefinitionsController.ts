import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getUnixTimestamp } from 'App/Helpers/Customs'
import Definition from 'App/Models/Definition'
import CreateDefinitionValidator from 'App/Validators/CreateDefinitionValidator'
import { DateTime } from 'luxon'

export default class DefinitionsController {
  public async index({ params, response }: HttpContextContract) {
    const { term } = params
    try {
      const definitions = await Definition.query()
        .preload('user')
        .preload('category')
        .where('status_definition_id', 2)
        .where('term', 'like', `${term}`)

      if (definitions.length === 0) {
        return response.status(404).json({
          code: 404,
          status: 'Not Found',
          message: 'Term not found',
        })
      }

      return response.json({
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
      return response.json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const defaultstatusDefinitionId = 1

    try {
      const payload = await request.validate(CreateDefinitionValidator)
      const validData = {
        ...payload,
        statusDefinitionId: defaultstatusDefinitionId,
      }
      const newDefinition = await Definition.create(validData)

      return response.status(201).json({
        code: 200,
        status: 'Success',
        message: 'Definition created',
        data: newDefinition,
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
    const defaultstatusDefinitionId = 1
    try {
      const payload = await request.validate(CreateDefinitionValidator)

      const definition = await Definition.findOrFail(id)
      if (!definition) {
        return response.json({
          code: 404,
          status: 'Not Found',
          message: 'Definition not found',
        })
      }

      const validData = {
        ...payload,
        statusDefinitionId: defaultstatusDefinitionId,
      }

      definition.merge(validData)
      await definition.save()

      return response.json({
        code: 200,
        status: 'Success',
        message: 'Definition updated',
        data: definition,
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
    try {
      const definition = await Definition.findByOrFail('id', id)
      if (!definition) {
        return response.json({
          code: 404,
          status: 'Not Found',
          message: 'Definition not found',
        })
      }

      definition.statusDefinitionId = 4
      definition.deletedAt = DateTime.local()
      await definition.save()

      return response.json({
        code: 200,
        status: 'Success',
        message: 'Definition deleted',
      })
    } catch (error) {
      return response.json({
        code: 500,
        status: 'Error',
        message: 'Internal server error',
      })
    }
  }
}
