// Init the kDevMode env etc
import '@deskbtm/gadgets/env';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import '@fontsource/inter';
import 'es-module-shims';

import { disableGlobalContextMenu } from '@publish/shared';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { reportWebVitals } from './reportWebVitals.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense>
      <App />
    </Suspense>
  </React.StrictMode>,
);

disableGlobalContextMenu();

reportWebVitals(!kProdMode ? console.debug : undefined);
