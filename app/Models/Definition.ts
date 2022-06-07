import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Category from './Category'
import StatusDefinition from './StatusDefinition'
import Vote from './Vote'

export default class Definition extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public statusDefinitionId!: number

  @column()
  public categoryId!: number

  @column()
  public term!: string

  @column()
  public definition!: string

  @column()
  public totalVotes!: number

  @column()
  public totalUpVotes!: number

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @column.dateTime()
  public deletedAt!: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Category)
  public category!: BelongsTo<typeof Category>

  @belongsTo(() => StatusDefinition)
  public statusDefinition!: BelongsTo<typeof StatusDefinition>

  @hasMany(() => Vote)
  public vote!: HasMany<typeof Vote>
}
