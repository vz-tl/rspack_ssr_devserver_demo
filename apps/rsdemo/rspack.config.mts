import { Socket } from 'node:net';
import { IncomingMessage, ServerResponse } from 'node:http';

import { createProxyMiddleware } from 'http-proxy-middleware';
import { createConfig } from '@nx/angular-rspack';
import { DevServerMiddleware } from '@rspack/core';

type Response = ServerResponse & { locals?: any };

export default createConfig(
  {
    options: {
      root: __dirname,
      outputPath: {
        base: '../../dist/rsdemo',
      },
      index: './src/index.html',
      browser: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        {
          glob: '**/*',
          input: './public',
        },
      ],
      ssr: {
        entry: './src/server.ts',
      },
      server: './src/main.server.ts',
      outputMode: 'server',
      security: {
        allowedHosts: ['*'],
      },
    },
    rspackConfigOverrides: {
      // lazyCompilation doesn't work and causes issues,
      // as long there's no fix it might be good to disable it by the plugin.
      lazyCompilation: false,
      devServer: {
        // use liveReload for server-exclusive files
        watchFiles: [
          'src/app/app.config.server.ts',
          'src/main.server.ts',
          'src/server.ts',
        ],
        // the following 2 settings need to be disabled
        // to make the below configured proxy middleware working
        historyApiFallback: false,
        devMiddleware: {
          index: false,
        },
        setupMiddlewares: (middlewares, devServer) => {
          // a naive assumption the port below the devServer port is unused. needs a more reliable solution.
          const port = String(devServer.options.port - 1);
          // server.ts usually configures the server port based on process.env.PORT
          process.env.PORT = port;

          // set up a retry proxy middleware to pass-thru all requests to the server-app.
          // it provides a retry mechanism in case the server-app hasn't fully restarted.
          const proxy = createProxyMiddleware({
            target: `http://localhost:${port}`,
            on: {
              error: ({ message }: Error, req, res: Response | Socket) => {
                if (message.includes('ECONNREFUSED')) {
                  const { retry } = (res as Response).locals;
                  if (retry) {
                    return retry();
                  }

                  (res as Response).statusCode = 500;
                  res.end(message);
                }
              },
            },
          });

          const retryProxy: DevServerMiddleware = async (
            req: IncomingMessage,
            res: Response,
          ) => {
            const proxyFn = (): Promise<void> => proxy(req, res);

            res.locals ||= {};
            let retries = 0;

            res.locals.retry = async () => {
              if (++retries > 2) {
                delete res.locals.retry;
              }

              await new Promise((resolve) => setTimeout(resolve, 1000));

              return proxyFn();
            };

            return proxyFn();
          };

          middlewares.push(retryProxy);

          return middlewares;
        },
      },
    },
  },
  {
    production: {
      options: {
        outputHashing: 'all',
      },
    },

    development: {
      options: {
        optimization: false,
        vendorChunk: true,
        extractLicenses: false,
        sourceMap: true,
        namedChunks: true,
        devServer: {
          hmr: true,
          port: 4200,
          proxyConfig: './proxy.conf.json',
          allowedHosts: ['*'],
        },
      },
    },
  },
);
