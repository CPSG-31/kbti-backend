import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Definition from './Definition'

export default class StatusDefinition extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public statusDefinition!: string

  @hasMany(() => Definition)
  public definition!: HasMany<typeof Definition>
}
