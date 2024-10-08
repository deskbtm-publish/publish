import { is } from '@deskbtm/gadgets/is';

export class LocalStore {
  static set<T extends object>(key: string, value: T) {
    const v = this.get(key);
    localStorage.setItem(
      key,
      JSON.stringify(v ? Object.assign({}, v, value) : value),
    );
  }

  static get<T extends any>(key: string, defaultValue?: T): T | undefined {
    try {
      const v = localStorage.getItem(key);

      if (!v) return defaultValue;

      const vv = JSON.parse(v);

      if (is.object(vv)) {
        return Object.assign({}, defaultValue, v);
      }
      return vv;
    } catch (error) {
      return {} as T;
    }
  }
}
