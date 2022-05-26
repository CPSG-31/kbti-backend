import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Definition from 'App/Models/Definition'

export default class DefinitionSeeder extends BaseSeeder {
  public async run() {
    await Definition.createMany([
      {
        userId: 2,
        categoryId: 1,
        statusDefinitionId: 1,
        term: 'term1',
        definition: 'definition1',
      },
      {
        userId: 2,
        categoryId: 2,
        statusDefinitionId: 2,
        term: 'term2',
        definition: 'definition2',
      },
      {
        userId: 2,
        categoryId: 3,
        statusDefinitionId: 3,
        term: 'term3',
        definition: 'definition3',
      },
      {
        userId: 3,
        categoryId: 4,
        statusDefinitionId: 4,
        term: 'term4',
        definition: 'definition4',
      },
    ])
  }
}
