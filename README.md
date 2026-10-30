# Angular-Rspack SSR devServer demo app

All required devServer related configurations are explained in `rspack.config.mts`.

Start the app via `npm start`

When navigating to Products feature using the navigation link at the top of the page,
the product data will be requested from `/api` endpoint provided by the proxy.config, proving the proxy to work.

Changing any Angular file will trigger a hot module reload. Changing server-only files will trigger a full page reload.
To make this work, the inline script listening to the ssr-reload websocket messages has to be removed as it's conflicting with HMR.
As a workaround to avoid patching angular-rspack plugin, the removal happens in the app component (`apps/rsdemo/src/app/app.ts`).
