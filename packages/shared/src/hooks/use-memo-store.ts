import type { DependencyList } from 'react';
import { useMemo } from 'react';

import { LocalStore } from '../utils';

export const useMemoStore = function <T>(
  key: string,
  defaultValue?: T,
  deps: DependencyList = [],
) {
  return useMemo<T>(
    () => LocalStore.get(key, defaultValue) as unknown as T,
    deps,
  );
};
