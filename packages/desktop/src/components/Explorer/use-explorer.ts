import { use } from 'react';

import { ExplorerContext } from './ExplorerContext';

export const useExplorer = function () {
  return use(ExplorerContext);
};
