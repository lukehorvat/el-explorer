import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

self.__WB_DISABLE_DEV_LOGS = true;

clientsClaim();

/**
 * At runtime, cache any requests for EL data files as they happen.
 *
 * Once a file is cached, the service worker will intercept all future requests
 * for that file and ensure that it is fetched from the cache instead of the
 * network. The cache persists across subsequent page loads/refreshes, of course.
 *
 * Each file is automatically removed from the cache after 50 days.
 */
registerRoute(
  ({ url }) => !!url.pathname.match(/^\/data\//),
  new CacheFirst({
    cacheName: 'el-data',
    matchOptions: { ignoreVary: true },
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 50 })],
  })
);
