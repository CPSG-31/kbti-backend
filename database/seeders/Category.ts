import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class CategorySeeder extends BaseSeeder {
  public async run() {
    await Category.updateOrCreateMany('category', [
      { category: 'Internet' },
      { category: 'Jaringan' },
      { category: 'Sistem Operasi' },
      { category: 'Pemrograman' },
      { category: 'Perangkat Keras' },
      { category: 'Perangkat Lunak' },
      { category: 'Web' },
      { category: 'Keamanan' },
    ])
  }
}
