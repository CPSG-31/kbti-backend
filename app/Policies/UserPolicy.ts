import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class UserPolicy extends BasePolicy {
  public async getAllUsers(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async getUserById(user: User) {
    return user.roleId === Roles.ADMIN
  }

  public async deleteUserById(user: User) {
    return user.roleId === Roles.ADMIN
  }
}
