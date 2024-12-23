import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { FeaturesService } from '../service/features.service';
import { CreateFeatureDto } from '../dto/create-features.dto';
import { UpdateFeatureDto } from '../dto/update-features.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateAccessFeatureDto } from '../dto/create-access-feature.dto';
import { UpdateAccessFeatureDto } from '../dto/update-access-feature.dto';

@Controller('features')
export class FeaturesController {
  constructor(private featuresService: FeaturesService) {}

  @Get()
  @ApiBearerAuth()
  async getFeatures(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.featuresService.getFeatures(page, limit);
    return {
      data: result.data,
      metadata: result.metadata,
    };
  }

  @Get(':featureId')
  @ApiBearerAuth()
  async getFeatureById(@Param('featureId') featureId: string) {
    const result = await this.featuresService.getFeatureById(featureId);
    return {
      data: result,
    };
  }

  @Get('name/:featureName')
  @ApiBearerAuth()
  async getFeatureByName(@Param('featureName') featureName: string) {
    const result = await this.featuresService.getFeatureByName(featureName);
    return {
      data: result,
    };
  }

  @Post()
  @ApiBearerAuth()
  async createFeature(
    @Body() createFeatureDto: CreateFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.createFeature(
      createFeatureDto,
      user.userId,
    );
    return {
      data: result,
    };
  }

  @Patch(':featureId')
  @ApiBearerAuth()
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

  @Delete(':featureId')
  @ApiBearerAuth()
  async deleteFeature(@Param('featureId') featureId: string): Promise<void> {
    return this.featuresService.deleteFeature(featureId);
  }

  @Post('/accessFeature')
  @ApiBearerAuth()
  async createAccessFeature(
    @Body() createAccessFeature: CreateAccessFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.createAccessFeature({
      createdBy: user?.userId,
      ...createAccessFeature,
    });

    return {
      data: result,
    };
  }

  @Patch('/accessFeature/:accessFeatureId')
  @ApiBearerAuth()
  async updateAccessFeature(
    @Param('accessFeatureId') accessFeatureId: string,
    @Body() updateAccessFeatureDto: UpdateAccessFeatureDto,
    @User() user: JwtPayload,
  ) {
    const result = await this.featuresService.updateAccessFeatureById(
      accessFeatureId,
      {
        updatedBy: user?.userId,
        ...updateAccessFeatureDto,
      },
    );

    return {
      data: result,
    };
  }

  @Delete('/accessFeature/:accessFeatureId')
  @ApiBearerAuth()
  async deleteAccessFeature(@Param('accessFeatureId') accessFeatureId: string) {
    const result = await this.featuresService.deleteAccessFeatureById(accessFeatureId);

    return {
      data: result,
    };
  }
}
