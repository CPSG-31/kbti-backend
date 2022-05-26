import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import StatusDefinition from 'App/Models/StatusDefinition'

export default class StatusDefinitionSeeder extends BaseSeeder {
  public async run() {
    await StatusDefinition.createMany([
      {
        statusDefinition: 'Direview',
      },
      {
        statusDefinition: 'Disetujui',
      },
      {
        statusDefinition: 'Ditolak',
      },
      {
        statusDefinition: 'Dihapus',
      },
    ])
  }
}
