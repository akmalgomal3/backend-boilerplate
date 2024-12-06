import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Public()
  @Get()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics();
    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
  }

  @Public()
  @Post('/webhook-alert')
  async webhookAlert(@Req() req, @Res() res: Response) {
    console.log('Webhook alert received', req.body);
    res.status(200).send();
  }
}
