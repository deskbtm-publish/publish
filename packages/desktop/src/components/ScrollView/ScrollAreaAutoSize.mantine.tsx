import {
  Box,
  factory,
  ScrollArea,
  type ScrollAreaFactory,
  type ScrollAreaProps,
  useProps,
} from '@mantine/core';
import { classes } from '@publish-kit/react-dnd-treeview/stories/argTypes';

const defaultProps: Partial<ScrollAreaProps> = {
  scrollHideDelay: 1000,
  type: 'hover',
  scrollbars: 'xy',
};

export const ScrollAreaAutosize = factory<ScrollAreaFactory>((props, ref) => {
  const {
    children,
    classNames,
    styles,
    scrollbarSize,
    scrollHideDelay,
    type,
    dir,
    offsetScrollbars,
    viewportRef,
    onScrollPositionChange,
    unstyled,
    variant,
    viewportProps,
    scrollbars,
    style,
    vars,
    onBottomReached,
    onTopReached,
    ...others
  } = useProps('ScrollAreaAutosize', defaultProps, props);

  return (
    <Box
      {...others}
      ref={ref}
      style={[{ display: 'flex', overflow: 'auto' }, style]}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          // width: '100%',
          flex: 1,
        }}
      >
        <ScrollArea
          classNames={classNames}
          styles={styles}
          scrollHideDelay={scrollHideDelay}
          scrollbarSize={scrollbarSize}
          type={type}
          dir={dir}
          offsetScrollbars={offsetScrollbars}
          viewportRef={viewportRef}
          onScrollPositionChange={onScrollPositionChange}
          unstyled={unstyled}
          variant={variant}
          viewportProps={viewportProps}
          vars={vars}
          scrollbars={scrollbars}
          onBottomReached={onBottomReached}
          onTopReached={onTopReached}
        >
          {children}
        </ScrollArea>
      </Box>
    </Box>
  );
});

ScrollArea.classes = classes;
ScrollAreaAutosize.displayName = '@mantine/core/ScrollAreaAutosize';
ScrollAreaAutosize.classes = classes;
ScrollArea.Autosize = ScrollAreaAutosize;
