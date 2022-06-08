import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import StatusDefinitions from 'App/Enums/StatusDefinitions'
import StatusDefinition from 'App/Models/StatusDefinition'

export default class StatusDefinitionSeeder extends BaseSeeder {
  public async run() {
    await StatusDefinition.createMany([
      {
        id: StatusDefinitions.REVIEW,
        statusDefinition: 'Direview',
      },
      {
        id: StatusDefinitions.APPROVED,
        statusDefinition: 'Disetujui',
      },
      {
        id: StatusDefinitions.REJECTED,
        statusDefinition: 'Ditolak',
      },
      {
        id: StatusDefinitions.DELETED,
        statusDefinition: 'Dihapus',
      },
    ])
  }
}
