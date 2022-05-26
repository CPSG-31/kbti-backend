import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'status_definitions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('status_definition', 80)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
