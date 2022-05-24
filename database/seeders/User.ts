import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        roleId: 1,
        username: 'admin',
        email: 'admin@admin.com',
        password: 'adminpass',
        isActive: true,
      },
      {
        roleId: 2,
        username: 'user1',
        email: 'user1@user.com',
        password: 'userpass',
        isActive: true,
      },
      {
        roleId: 2,
        username: 'user2',
        email: 'user2@user.com',
        password: 'userpass',
        isActive: true,
      },
    ])
  }
}
