import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Enable detailed logging if needed
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Configure the OTLP Trace Exporter to send data to Elastic APM
const apmExporter = new OTLPTraceExporter({
  url: 'http://localhost:8200', // Replace with your APM server URL
});

// Configure the opentelematry send data to Jeager Exporter
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://10.53.26.164:14268/api/traces',
});

const traceExporter = jaegerExporter; // You can use apmExporter (APM Elastic) or Jeager

export const otelSDK = new NodeSDK({
  resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: `otel-trias`}),
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations()], //to get opentelematry data
});

// Start the SDK
otelSDK.start()

// Graceful shutdown
process.on('SIGTERM', () => {
    otelSDK
    .shutdown()
    .then(
        () => console.log('OpenTelemetry shut down'), 
        (err) => console.log('Error shutting down SDK', err),
    )
    .catch((err) => console.error('Error shutting down OpenTelemetry', err))
    .finally(() => process.exit(0));
});
