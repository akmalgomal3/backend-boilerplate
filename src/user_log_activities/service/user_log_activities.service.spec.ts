import { Test, TestingModule } from '@nestjs/testing';
import { UserLogActivitiesService } from './user_log_activities.service';

describe('UserLogActivitiesService', () => {
  let service: UserLogActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLogActivitiesService],
    }).compile();

    service = module.get<UserLogActivitiesService>(UserLogActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
