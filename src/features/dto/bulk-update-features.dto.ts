import { UpdateFeatureDto } from './update-features.dto';

export class BulkUpdateFeatureDto extends UpdateFeatureDto {
  featureId: string;
}
