import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: client.Registry;
  private readonly httpRequestTotal: client.Counter;
  private readonly requestTimeHistogram: client.Histogram;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'nestjs-prometheus' });
    client.collectDefaultMetrics({ register: this.register });

    const httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Number of requests',
      labelNames: ['method', 'path'],
    });

    const requestTimeHistogram = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'statusCode'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 7, 10],
    });

    this.register.registerMetric(httpRequestTotal);
    this.register.registerMetric(requestTimeHistogram);

    this.httpRequestTotal = httpRequestTotal;
    this.requestTimeHistogram = requestTimeHistogram;
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  incRequestTotal(method: string, path: string): void {
    this.httpRequestTotal.inc({ method, path });
  }

  observeRequestDuration(
    method: string,
    path: string,
    status: string,
    duration: number,
  ): void {
    this.requestTimeHistogram.labels(method, path, status).observe(duration);
  }
}
