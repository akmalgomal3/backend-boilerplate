import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FeaturesService } from '../service/features.service';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateUpdateBulkAccessFeatureDto } from '../dto/create-update-access-feature.dto';
import { AuthorizedRoles } from '../../common/decorators/authorized-roles.decorator';
import { RoleType } from '../../common/enums/user-roles.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FormInfo } from '../../common/types/form-info.type';

@ApiBearerAuth()
@Controller('features')
export class FeaturesController {
  constructor(private featuresService: FeaturesService) {}

  @Post('/get-all')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getFeatures(@Body() paginationDto: PaginationDto) {
    const result = await this.featuresService.getFeatures(paginationDto);
    return {
      data: {
        body: result.data,
        sort: paginationDto.sorts || [],
        filter: paginationDto.filters || [],
        search: paginationDto.search || [],
      },
      metadata: result.metadata,
    };
  }

  @Get(':featureId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getFeatureById(@Param('featureId') featureId: string) {
    const result = await this.featuresService.getFeatureById(featureId);
    return {
      data: result,
    };
  }

  @Get('name/:featureName')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async getFeatureByName(@Param('featureName') featureName: string) {
    const result = await this.featuresService.getFeatureByName(featureName);
    return {
      data: result,
    };
  }

  @Post()
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async createFeature(
    @Body() createFeatureDto: CreateFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.createFeature(
      createFeatureDto,
      user.userId,
    );
    return {
      data: {
        featureId: result,
      },
    };
  }

  @Patch('single-update/:featureId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async updateFeature(
    @Param('featureId') featureId: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.featuresService.updateFeature(
      featureId,
      updateFeatureDto,
      user.userId,
    );
  }

  @Patch('bulk-update')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async bulkUpdateFeature(
    @Body()
    updates: { featureId: string; updateFeatureDto: UpdateFeatureDto }[],
    @User() user: JwtPayload,
  ): Promise<void> {
    return this.featuresService.bulkUpdateFeature(updates, user.userId);
  }

  @Delete('single-delete/:featureId')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async deleteFeature(@Param('featureId') featureId: string): Promise<void> {
    return this.featuresService.deleteFeature(featureId);
  }

  @Get('/accessMenu/header/info')
  async getAccessMenuHeader() {
    const result = this.featuresService.getAccessFeatureHeader();
    return {
      data: result,
    };
  }

  @Delete('bulk-delete')
  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  async bulkDeleteFeature(
    @Body() featureIds: { featureId: string }[],
  ): Promise<void> {
    const ids = featureIds.map((feature) => feature.featureId);
    return this.featuresService.bulkDeleteFeature(ids);
  }

  @ApiBearerAuth()
  @AuthorizedRoles(RoleType.Admin)
  @Get('/accessFeature/create/body/:roleId')
  async getAllFeatureToCreateAccessFeature(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const result =
      await this.featuresService.getAllFeaturesToCreateAccessFeature(roleId);
    return {
      data: result,
    };
  }

  @Post('/accessFeature/create')
  @AuthorizedRoles(RoleType.Admin)
  @ApiBearerAuth()
  async createBulkAccessFeature(
    @Body() createBulkAccessFeature: CreateUpdateBulkAccessFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.bulkCreateUpdateAccessFeature({
      createdBy: user?.userId,
      ...createBulkAccessFeature,
    });
    return {
      data: result,
    };
  }

  @Patch('/accessFeature/:roleId')
  @AuthorizedRoles(RoleType.Admin)
  @ApiBearerAuth()
  async updateBulkAccessFeature(
    @Body() updateBulkAccessFeatureFto: CreateUpdateBulkAccessFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.bulkCreateUpdateAccessFeature({
      createdBy: user?.userId,
      ...updateBulkAccessFeatureFto,
    });
    return {
      data: result,
    };
  }

  @Delete('/accessFeature/:roleId')
  @AuthorizedRoles(RoleType.Admin)
  @ApiBearerAuth()
  async deleteAccessFeatureByRoleId(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const result =
      await this.featuresService.deleteAccessFeatureByRoleId(roleId);
    return {
      data: result,
    };
  }

  @Get('/header/info')
  async getHeaderInfo() {
    const result = await this.featuresService.getFeatureHeader();
    return {
      data: result,
    };
  }

  @Get('form/create-update')
  @ApiQuery({ name: 'id', required: false })
  async getFormCreateUpdate(
    @Query('id', new ParseUUIDPipe({ optional: true })) featureId: string,
  ): Promise<{ data: FormInfo }> {
    const formInfo =
      await this.featuresService.formCreateUpdateFeature(featureId);
    return {
      data: formInfo,
    };
  }
}
