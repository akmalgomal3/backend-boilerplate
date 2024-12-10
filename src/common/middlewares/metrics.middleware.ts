import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrometheusService } from '../../libs/prometheus/prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private prometheusService: PrometheusService) {}

  use(req: any, res: any, next: () => void) {
    const startTime = process.hrtime();

    next();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const method: string = req.method;
      const path: string = req.originalUrl;
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const durationInSeconds: number = seconds + nanoseconds / 1e9;

      this.prometheusService.incRequestTotal(method, path);

      this.prometheusService.observeRequestDuration(
        method,
        path,
        statusCode.toString(),
        durationInSeconds,
      );
    });
  }
}
