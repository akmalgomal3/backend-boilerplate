// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

export function initializeSentry(configService: ConfigService) {
  const sentryDsn = configService.get<string>('SENTRY_DSN');

  Sentry.init({
    dsn: sentryDsn,
    integrations: [nodeProfilingIntegration()],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  });
  // Manually call startProfiler and stopProfiler
  // to profile the code in between
  Sentry.profiler.startProfiler();

  // Starts a transaction that will also be profiled
  Sentry.startSpan(
    {
      name: 'My First Transaction',
    },
    () => {
      // the code executing inside the transaction will be wrapped in a span and profiled
    },
  );

  // Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
  // your application until the process exits or stopProfiling is called.
  Sentry.profiler.stopProfiler();
}
