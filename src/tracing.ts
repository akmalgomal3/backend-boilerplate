import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

const traceExporter = jaegerExporter;

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `nestjs-otel`,
  }),
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  otelSDK.start();
} catch (e) {
  console.log(e);
}

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
