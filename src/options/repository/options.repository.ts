import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class OptionsRepository {
  constructor(
    @Inject('DB_POSTGRES')
    private dataSource: DataSource,
  ) {}

  async getOptionTable(
    tableName: string,
    columnName: string,
    pkName: string,
    search: string,
  ) {
    try {
      const query = `
          SELECT ${pkName} as "key",
              ${columnName} as "value"
          FROM ${tableName}
          WHERE ${columnName} ILIKE '%${search}%'
        `;

      const result = await this.dataSource.query(query);

      return result;
    } catch (error) {
      throw error;
    }
  }
}
