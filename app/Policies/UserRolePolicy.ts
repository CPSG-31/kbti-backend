import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class UserRolePolicy extends BasePolicy {
  public async updateUserRole(user: User) {
    return user.roleId === Roles.ADMIN
  }
}
