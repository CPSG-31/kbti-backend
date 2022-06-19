import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class DashboardUserPolicy extends BasePolicy {
  public async view(user: User) {
    return user.roleId === Roles.USER
  }
}
