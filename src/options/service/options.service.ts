import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { OptionsRepository } from '../repository/options.repository';
import { RoleType } from '../../common/enums/user-roles.enum';
import { UserAuthRequestType } from '../../common/enums/request-type.enum';
import { DeviceType } from '../../common/enums/device-type.enum';
import { ErrorMessages } from '../../common/exceptions/root-error.message';

@Injectable()
export class OptionsService {
  constructor(private readonly optionsRepository: OptionsRepository) {}

  private readonly enums = {
    RoleType,
    UserAuthRequestType,
    DeviceType,
  };

  async getOptionTable(
    tableName: string,
    columnName: string,
    pkName: string,
    search: string,
  ) {
    try {
      return await this.optionsRepository.getOptionTable(
        tableName,
        columnName,
        pkName,
        search,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get option table',
        error.status || 500,
      );
    }
  }

  async getEnum(enumName: string) {
    try {
      const enumObj = this.enums[enumName];

      console.log(Object.keys(this.enums).join(', ').toString());
      if (!enumObj) {
        throw new NotFoundException(
          ErrorMessages.options.dynamicMessage(
            ErrorMessages.options.getMessage('ERROR_GET_ENUM_NOT_FOUND'),
            { availableEnums: Object.keys(this.enums).join(', ').toString() },
          ),
        );
      }

      const result = Object.values(enumObj).map((value, index) => ({
        key: (index + 1).toString(),
        value,
      }));

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error get enum',
        error.status || 500,
      );
    }
  }
}
