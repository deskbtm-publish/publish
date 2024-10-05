import { purify } from '../utils';

export type WithDefaultProps<T, U> = T & {
  [Key in Extract<keyof T, keyof U>]-?: U[Key] | NonNullable<T[Key]>;
};

/**
 * @param defaultProps Default props for the component.
 * @param props props for the component.
 * @returns
 *
 * @example
 * ```tsx
 * const defaultProps = {foo: 'bar'};
 *
 * function App(_props) {
 *  const props = useProps(defaultProps, _props);
 * }
 * ```
 */
export function useProps<
  T extends Record<string, any>,
  U extends Partial<T> = object,
>(defaultProps: U, props: T): WithDefaultProps<T, U> {
  return { ...defaultProps, ...purify(props) };
}
