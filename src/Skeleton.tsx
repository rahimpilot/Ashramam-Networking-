import React from 'react';

/**
 * Shimmer skeleton placeholders — FB-app style loading.
 * Use instead of spinners while content loads.
 */

export const SkeletonLine: React.FC<{ width?: string; height?: number; style?: React.CSSProperties }> =
  ({ width = '100%', height = 14, style }) => (
    <div className="iv-skeleton" style={{ width, height, ...style }} />
  );

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <div className="iv-skeleton" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
);

/** A skeleton post card mimicking the feed layout */
export const SkeletonPost: React.FC = () => (
  <div className="iv-card" style={{ padding: 16, marginBottom: 12 }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
      <SkeletonAvatar />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="40%" height={13} style={{ marginBottom: 8 }} />
        <SkeletonLine width="25%" height={11} />
      </div>
    </div>
    <SkeletonLine style={{ marginBottom: 8 }} />
    <SkeletonLine width="85%" style={{ marginBottom: 8 }} />
    <SkeletonLine width="60%" />
  </div>
);

/** A skeleton story card */
export const SkeletonStory: React.FC = () => (
  <div className="iv-card" style={{ padding: 16, marginBottom: 12 }}>
    <SkeletonLine width="55%" height={18} style={{ marginBottom: 12 }} />
    <SkeletonLine style={{ marginBottom: 8 }} />
    <SkeletonLine width="90%" style={{ marginBottom: 8 }} />
    <SkeletonLine width="70%" />
  </div>
);
