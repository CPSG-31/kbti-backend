import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  beforeSave,
} from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Definition from './Definition'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public roleId!: number

  @column()
  public username!: string

  @column()
  public email!: string

  @column()
  public password!: string

  @column()
  public isActive!: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => Role)
  public role!: BelongsTo<typeof Role>

  @hasMany(() => Definition)
  public definitions!: HasMany<typeof Definition>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
