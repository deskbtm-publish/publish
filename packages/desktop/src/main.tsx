// Init the kDevMode env etc.

import '@deskbtm/gadgets/env';
// Must be imported before mantine styles, otherwise conflict with mantine styles.
import 'jotai-devtools/styles.css';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@fontsource/inter';
import 'es-module-shims';
import './styles/preset.module.css';
import './styles/dev.css';

import { disableGlobalContextMenu } from '@publish/shared';
/// #if DEV
import { scan } from 'react-scan';
if (typeof window !== 'undefined') {
  scan({
    enabled: true,
    log: true,
    animationSpeed: 'off',
  });
}
/// #endif
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { reportWebVitals } from './reportWebVitals';

const rootContainer = document.getElementById('root');

if (rootContainer) {
  ReactDOM.createRoot(rootContainer).render(
    <React.StrictMode>
      <Suspense>
        <App />
      </Suspense>
    </React.StrictMode>,
  );
}

disableGlobalContextMenu();

reportWebVitals(!kProdMode ? console.debug : undefined);
