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
      const durationInSeconds = seconds + nanoseconds / 1e9;

      if (statusCode >= 200 && statusCode < 400) {
        this.prometheusService.incSuccessCounter(method, path);
      } else {
        this.prometheusService.incFailedCounter(method, path);
      }

      this.prometheusService.observeRequestDuration(
        method,
        path,
        statusCode.toString(),
        durationInSeconds,
      );
    });
  }
}
