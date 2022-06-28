import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  // public static developmentOnly = true

  public async run() {
    await User.fetchOrCreateMany(['username', 'email'], [
      { roleId: Roles.ADMIN, username: 'admin', email: 'admin@admin.com', password: 'adminpass' },
      { roleId: Roles.USER, username: 'user', email: 'user@user.com', password: 'userpass' },
    ])
  }
}
