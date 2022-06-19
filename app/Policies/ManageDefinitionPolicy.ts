import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class ManageDefinitionPolicy extends BasePolicy {
  public async getDefinitions(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async getReviewedDefinitions(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async reviewDefinition(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async getDeletedDefinitions(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async deleteDefinition(user: User) {
    return user.roleId === Roles.ADMIN
  }
}
