import { Controller, Get, Param, Query } from '@nestjs/common';
import { OptionsService } from '../service/options.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @ApiQuery({ name: 'search', required: false })
  @Get('data/:tableName/:columnName')
  async getOptionTable(
    @Param('tableName') tableName: string,
    @Param('columnName') columnName: string,
    @Query('pkName') pkName: string,
    @Query('search') search: string = '',
  ) {
    const result = await this.optionsService.getOptionTable(
      tableName,
      columnName,
      pkName,
      search,
    );
    return {
      data: result,
    };
  }

  @Get('enum/:enumName')
  async getEnum(@Param('enumName') enumName: string) {
    const result = await this.optionsService.getEnum(enumName);
    return {
      data: result,
    };
  }
}
