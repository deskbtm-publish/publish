import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

const routes = [
  {
    path: '/',
    lazy: () => import('./components/Layout'),
  },
  {
    // path: '/workspace/:workspaceId',
    // lazy: () => import('./pages/workspace/index'),
    // children: [],
  },
] satisfies RouteObject[];

export const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
    v7_partialHydration: true,
  },
});
