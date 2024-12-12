import { Test, TestingModule } from '@nestjs/testing';
import { UserLogActivitiesController } from './user_log_activities.controller';

describe('UserLogActivitiesController', () => {
  let controller: UserLogActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLogActivitiesController],
    }).compile();

    controller = module.get<UserLogActivitiesController>(UserLogActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
