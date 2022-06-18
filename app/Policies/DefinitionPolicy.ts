import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Roles from 'App/Enums/Roles'
import StatusDefinitions from 'App/Enums/StatusDefinitions'
import Definition from 'App/Models/Definition'
import User from 'App/Models/User'

export default class DefinitionPolicy extends BasePolicy {
  public async updateDefinition(user: User, definition: Definition) {
    return definition.userId === user.id
  }

  public async deleteDefinition(user: User, definition: Definition) {
    return (
      (definition.userId === user.id || user.roleId === Roles.ADMIN) &&
      definition.statusDefinitionId !== StatusDefinitions.DELETED
    )
  }
}
