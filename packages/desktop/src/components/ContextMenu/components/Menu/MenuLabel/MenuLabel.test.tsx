import { createContextContainer, tests } from '@mantine/tests';

import { Menu } from '../Menu';
import type { MenuLabelProps, MenuLabelStylesNames } from './MenuLabel';
import { MenuLabel } from './MenuLabel';

const TestContainer = createContextContainer(MenuLabel, Menu, { opened: true });

const defaultProps: MenuLabelProps = {};

describe('@mantine/core/MenuLabel', () => {
  tests.itSupportsSystemProps<MenuLabelProps, MenuLabelStylesNames>({
    component: TestContainer,
    props: defaultProps,
    styleProps: true,
    children: true,
    extend: true,
    variant: true,
    size: true,
    classes: true,
    id: true,
    refType: HTMLDivElement,
    displayName: '@mantine/core/MenuLabel',
    stylesApiSelectors: ['label'],
    stylesApiName: 'Menu',
    compound: true,
    providerStylesApi: false,
  });
});
