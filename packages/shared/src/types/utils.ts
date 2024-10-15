export type Nullish = undefined | null;

export type Override<
  Type,
  NewType extends { [key in keyof Type]?: NewType[key] },
> = Omit<Type, keyof NewType> & NewType;
