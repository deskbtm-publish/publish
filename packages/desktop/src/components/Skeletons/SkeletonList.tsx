import type { SkeletonProps } from '@mantine/core';
import { Skeleton } from '@mantine/core';
import type { FC } from 'react';
import { useProps } from 'reactgets/hooks/use-props';

interface SkeletonListProps {
  count?: number;
  ip?: SkeletonProps;
}

const defaultProps = {
  count: 5,
  ip: {
    h: 28,
    animate: false,
    mt: 'sm',
  },
};

export const SkeletonList: FC<SkeletonListProps> = function (_props) {
  const { count, ip } = useProps(defaultProps, _props);

  return Array(count)
    .fill(0)
    .map((_, index) => <Skeleton key={index} {...ip} />);
};
