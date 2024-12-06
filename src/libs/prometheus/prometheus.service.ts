import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: client.Registry;
  private readonly successCounter: client.Counter;
  private readonly failedCounter: client.Counter;
  private readonly requestTimeHistogram: client.Histogram;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'nestjs-prometheus' });
    client.collectDefaultMetrics({ register: this.register });

    const successCounter = new client.Counter({
      name: 'success_counter',
      help: 'Number of successful requests',
      labelNames: ['method', 'path'],
    });

    const failedCounter = new client.Counter({
      name: 'failed_counter',
      help: 'Number of failed requests',
      labelNames: ['method', 'path'],
    });

    const requestTimeHistogram = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'statusCode'],
      buckets: [0.1, 0.5, 1, 2.5, 5, 7, 10],
    });

    this.register.registerMetric(successCounter);
    this.register.registerMetric(failedCounter);
    this.register.registerMetric(requestTimeHistogram);

    this.successCounter = successCounter;
    this.failedCounter = failedCounter;
    this.requestTimeHistogram = requestTimeHistogram;
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  incSuccessCounter(method: string, path: string): void {
    this.successCounter.inc({ method, path });
  }

  incFailedCounter(method: string, path: string): void {
    this.failedCounter.inc({ method, path });
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
