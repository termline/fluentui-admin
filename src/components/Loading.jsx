import React from 'react';
import { Spinner } from '@fluentui/react-components';

const Loading = ({ label = '加载中...', size = 'tiny', style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
    <Spinner size={size} /> {label}
  </div>
);

export default Loading;
