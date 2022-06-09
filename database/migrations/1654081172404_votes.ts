import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'votes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('definition_id')
        .unsigned()
        .references('id')
        .inTable('definitions')
        .onDelete('CASCADE')
      table.boolean('is_upvote').notNullable()
    })
  }

  public async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
