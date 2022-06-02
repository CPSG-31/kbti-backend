import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Vote extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public definitionId: number

  @column()
  public isUpvote: boolean
}
