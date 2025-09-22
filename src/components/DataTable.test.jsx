import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './DataTable.jsx';

const baseColumns = [
  { key: 'id', name: 'ID', sortable: true },
  { key: 'name', name: '名称', sortable: true },
];

const sampleData = [
  { id: 2, name: 'Beta' },
  { id: 1, name: 'Alpha' },
  { id: 3, name: 'Gamma' },
];

describe('DataTable', () => {
  beforeEach(() => {
    // noop
  });

  it('renders empty state', () => {
    render(<DataTable columns={baseColumns} data={[]} emptyText="空" />);
    expect(screen.getByText('空')).toBeInTheDocument();
  });

  it('supports sorting asc/desc', () => {
    render(<DataTable columns={baseColumns} data={sampleData} initialSort={{ key: 'id', direction: 'asc' }} />);
    // Asc initial: first row should have id 1
    const rows = screen.getAllByRole('row').slice(1); // skip header
    expect(rows[0]).toHaveTextContent('1');
    // Click ID header to toggle desc
    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);
    const rows2 = screen.getAllByRole('row').slice(1);
    expect(rows2[0]).toHaveTextContent('3');
  });

  it('selection: select all and clear', () => {
    const handleSelection = (rows, ids) => {
      // we just assert later via DOM
    };
    render(<DataTable columns={baseColumns} data={sampleData} enableSelection onSelectionChange={handleSelection} />);
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox); // select all
    // now all row checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.slice(1).every(cb => cb.checked)).toBe(true);
    fireEvent.click(headerCheckbox); // clear
    expect(checkboxes.slice(1).every(cb => !cb.checked)).toBe(true);
  });
});
