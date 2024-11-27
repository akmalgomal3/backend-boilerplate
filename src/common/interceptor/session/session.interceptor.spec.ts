import { SessionInterceptor } from './session.interceptor';
import { SessionService } from '../../../libs/session/services/session.service';
import { Reflector } from '@nestjs/core';
import { SessionRepository } from '../../../libs/session/repository/session.repository';

describe('SessionInterceptor', () => {
  let sessionInterceptor: SessionInterceptor;
  let sessionService: SessionService;
  let reflector: Reflector;
  let sessionRepository: SessionRepository;

  beforeEach(() => {
    sessionService = new SessionService(sessionRepository);
    reflector = new Reflector();
    sessionInterceptor = new SessionInterceptor(sessionService, reflector);
  });

  it('should be defined', () => {
    expect(sessionInterceptor).toBeDefined();
  });
});
