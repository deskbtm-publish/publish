export enum OptionKinds {
  simple = 'simple',
  image = 'image',
  select = 'select',
  multiSelect = 'multiSelect',
  input = 'input',
  number = 'number',
  confirm = 'confirm',
  checkbox = 'checkbox',
  radio = 'radio',
  color = 'color',
  date = 'date',
  time = 'time',
  file = 'file',
  pin = 'pin',
  rating = 'rating',
  slider = 'slider',
  switch = 'switch',
  segment = 'segment',
  tags = 'tags',
  clips = 'clips',
  tip = 'tip',
  userProfile = 'userProfile',
  update = 'update',
  link = 'link',
}

export interface ComboboxItem {
  value: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface ComboboxItemGroup {
  group: string;
  items: (ComboboxItem | string)[];
}

export interface ComboboxParsedItemGroup {
  group: string;
  items: ComboboxItem[];
}

export type ComboboxData = (string | ComboboxItem | ComboboxItemGroup)[];

export interface CommonOptions {
  title?: string;
  description?: string;
}

export interface SimpleOptions extends CommonOptions {
  type: OptionKinds.simple;
  trailing?: string;
}

export interface ImageOptions extends CommonOptions {
  type: OptionKinds.image;
  /**
   * The urls can be displayed by <img />.
   * e.g. url string, blob, base64 string...
   */
  urls?: (string | Blob | unknown)[];
}

export interface SelectOptions extends CommonOptions {
  type: OptionKinds.select;
  data: ComboboxData;
}

export interface InputBasicOptions {
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  value?: string | readonly string[] | number;
}

export interface InputOptions extends CommonOptions, InputBasicOptions {
  type: OptionKinds.input;
  /**
   * @defaultValue `text`
   */
  mode: 'text' | 'password' | 'email' | 'json';
}

export interface NumberOptions extends CommonOptions, InputBasicOptions {
  type: OptionKinds.number;
  min?: number;
  max?: number;
}

export interface MultiSelectOptions extends CommonOptions {
  type: OptionKinds.multiSelect;
}

export interface ConfirmOptions extends CommonOptions {
  type: OptionKinds.confirm;
}

export interface CheckboxOptions extends CommonOptions {
  type: OptionKinds.checkbox;
  data: (ComboboxItem | ComboboxItemGroup)[];
}

export interface RadioOptions extends CommonOptions {
  type: OptionKinds.radio;
  data: (ComboboxItem | ComboboxItemGroup)[];
}

export interface ColorOptions extends CommonOptions {
  type: OptionKinds.color;
}

export interface DateOptions extends CommonOptions {
  type: OptionKinds.date;
}
export interface TimeOptions extends CommonOptions {
  type: OptionKinds.time;
}
export interface FileOptions extends CommonOptions {
  type: OptionKinds.file;
}
export interface PinOptions extends CommonOptions {
  type: OptionKinds.pin;
}
export interface RatingOptions extends CommonOptions {
  type: OptionKinds.rating;
}
export interface SliderOptions extends CommonOptions {
  type: OptionKinds.slider;
}
export interface SwitchOptions extends CommonOptions {
  type: OptionKinds.switch;
}
export interface SegmentOptions extends CommonOptions {
  type: OptionKinds.segment;
}
export interface TagsOptions extends CommonOptions {
  type: OptionKinds.tags;
}
export interface ClipsOptions extends CommonOptions {
  type: OptionKinds.clips;
}
export interface TipOptions extends CommonOptions {
  type: OptionKinds.tip;
  /**
   * @defaultValue `info`
   */
  mode: 'warning' | 'success' | 'dangerous' | 'info';
}
export interface UserProfileOptions extends CommonOptions {
  type: OptionKinds.userProfile;
}
export interface UpdateOptions extends CommonOptions {
  type: OptionKinds.update;
}
export interface LinkOptions extends CommonOptions {
  type: OptionKinds.link;
  /**
   * @defaultValue `openInBrowser`
   */
  mode?: 'openInBrowser' | 'openInApp';
}

export type OptionOptions =
  | SimpleOptions
  | ImageOptions
  | SelectOptions
  | InputOptions
  | NumberOptions
  | MultiSelectOptions
  | ConfirmOptions
  | CheckboxOptions
  | RadioOptions
  | ColorOptions
  | DateOptions
  | TimeOptions
  | FileOptions
  | PinOptions
  | RatingOptions;

export class Option {
  /**
   * Simple option
   */
  static simple(options: Omit<SimpleOptions, 'type'>) {
    return Object.assign({}, { type: 'simple' }, options);
  }

  static image(options: Omit<ImageOptions, 'type'>) {
    return Object.assign({}, { type: 'image' }, options);
  }

  static select(options: Omit<SelectOptions, 'type'>) {
    return Object.assign({}, { type: 'select' }, options);
  }

  static multiSelect(options: Omit<MultiSelectOptions, 'type'>) {
    return Object.assign({}, { type: 'multiSelect' }, options);
  }

  // Input
  static input(options: Omit<InputOptions, 'type'>) {
    return Object.assign({}, { type: 'input', mode: 'text' }, options);
  }

  static number(options: Omit<NumberOptions, 'type'>) {
    return Object.assign({}, { type: 'number' }, options);
  }

  static confirm(options: Omit<ConfirmOptions, 'type'>) {
    return Object.assign({}, { type: 'confirm' }, options);
  }

  static checkbox(options: Omit<CheckboxOptions, 'type'>) {
    return Object.assign({}, { type: 'checkbox' }, options);
  }

  static radio(options: Omit<RadioOptions, 'type'>) {
    return Object.assign({}, { type: 'radio' }, options);
  }

  static color(options: Omit<ColorOptions, 'type'>) {
    return Object.assign({}, { type: 'color' }, options);
  }

  static date(options: Omit<DateOptions, 'type'>) {
    return Object.assign({}, { type: 'date' }, options);
  }

  static time(options: Omit<TimeOptions, 'type'>) {
    return Object.assign({}, { type: 'time' }, options);
  }

  static file(options: Omit<FileOptions, 'type'>) {
    return Object.assign({}, { type: 'file' }, options);
  }

  /**
   * Personal identification number
   */
  static pin(options: Omit<PinOptions, 'type'>) {
    return Object.assign({}, { type: 'pin' }, options);
  }

  /**
   * Rating
   */
  static rating(options: Omit<RatingOptions, 'type'>) {
    return Object.assign({}, { type: 'rating' }, options);
  }

  /**
   * Slider
   */
  static slider(options: Omit<SliderOptions, 'type'>) {
    return Object.assign({}, { type: 'slider' }, options);
  }

  static switch(options: Omit<SwitchOptions, 'type'>) {
    return Object.assign({}, { type: 'switch' }, options);
  }
  /**
   * Segmented controls
   */
  static segment(options: Omit<SegmentOptions, 'type'>) {
    return Object.assign({}, { type: 'segment' }, options);
  }

  static tags(options: Omit<TagsOptions, 'type'>) {
    return Object.assign({}, { type: 'tags' }, options);
  }

  static clips(options: Omit<ClipsOptions, 'type'>) {
    return Object.assign({}, { type: 'clip' }, options);
  }

  static tip(options: Omit<TipOptions, 'type'>) {
    return Object.assign({}, { type: 'tip', mode: 'info' }, options);
  }

  static userProfile(options: Omit<UserProfileOptions, 'type'>) {
    return Object.assign({}, { type: 'userProfile' }, options);
  }

  // Plugin update actions
  static update(options: Omit<UpdateOptions, 'type'>) {
    return Object.assign({}, { type: 'update' }, options);
  }

  static link(options: Omit<LinkOptions, 'type'>) {
    return Object.assign({}, { type: 'link', mode: 'openInBrowser' }, options);
  }
}
