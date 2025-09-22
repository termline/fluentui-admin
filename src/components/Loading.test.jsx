import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Loading from './Loading.jsx';

describe('Loading component', () => {
  it('renders default label', () => {
    render(<Loading />);
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
  it('renders custom label', () => {
    render(<Loading label="Fetching" />);
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });
});
