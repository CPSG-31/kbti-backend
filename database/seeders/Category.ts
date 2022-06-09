import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class CategorySeeder extends BaseSeeder {
  public async run() {
    await Category.createMany([
      { id: 1, category: 'Internet' },
      { id: 2, category: 'Jaringan' },
      { id: 3, category: 'Sistem Operasi' },
      { id: 4, category: 'Pemrograman' },
      { id: 5, category: 'Perangkat Keras' },
      { id: 6, category: 'Perangkat Lunak' },
      { id: 7, category: 'Web' },
      { id: 8, category: 'Keamanan' },
    ])
  }
}
