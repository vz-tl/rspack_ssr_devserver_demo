import {
  mergeApplicationConfig,
  ApplicationConfig,
  inject,
  DOCUMENT,
} from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => ({
        'http://localhost:3333': inject(DOCUMENT).location.origin,
      }),
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
