import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DevTools as JotaiDevTools } from 'jotai-devtools';
import type { FC } from 'react';
import { Suspense, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import type { ComposeProps } from 'reactgets';
import { Compose } from 'reactgets';
import { TauriOSProvider, TauriWindowProvider } from 'tauri-reactgets';
import { v4 } from 'uuid';

import { GlobalContextMenus } from './components/context-menus';
import { DevLab } from './components/Experiment/DevLab';
import { PublishSpotlight } from './components/Spotlight';
import { router } from './router';
import { resolver, theme } from './theme';

const DevTools: FC = function () {
  return kDevMode ? (
    <Suspense>
      <JotaiDevTools />
      <ReactQueryDevtools initialIsOpen={kDevMode} position="bottom" />
      <DevLab />
    </Suspense>
  ) : null;
};

function App() {
  const [queryClient] = useState(() => new QueryClient());

  const providers = [
    <MantineProvider
      key={v4()}
      theme={theme}
      cssVariablesResolver={resolver}
      defaultColorScheme="auto"
    />,
    <QueryClientProvider key={v4()} client={queryClient} />,
    process.env.PUBLISH_BUILD_PLATFORM === 'desktop' && [
      <TauriWindowProvider key={v4()} />,
      <TauriOSProvider key={v4()} />,
    ],
  ]
    .flat()
    .filter(Boolean) as ComposeProps['providers'];

  return (
    <Compose providers={providers}>
      <DevTools />
      <GlobalContextMenus />
      <PublishSpotlight />
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </Compose>
  );
}

export default App;
