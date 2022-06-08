import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Roles from 'App/Enums/Roles'
import Role from 'App/Models/Role'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.createMany([
      { id: Roles.ADMIN, roleName: 'admin' },
      { id: Roles.USER, roleName: 'user' },
    ])
  }
}
