import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Checkbox, Button, Popover, PopoverTrigger, PopoverSurface } from '@fluentui/react-components';
import { t } from '../i18n';

/**
 * 通用数据表组件
 * props:
 *  columns: Array<{ key: string, name: string, render?: (row)=>ReactNode, sortable?: boolean }>
 *  data: any[]
 *  loading: boolean
 *  error: string|null
 *  emptyText?: string
 *  onRetry?: ()=>void
 *  actionsColumn?: (row)=>ReactNode  // 可选操作列
 *  enableSelection?: boolean         // 是否启用行选择
 *  onSelectionChange?: (rows, ids)=>void
 *  pageSize?: number                 // 分页大小 (可选)，不传或 0 表示不分页
 *  initialSort?: { key: string, direction: 'asc'|'desc' }
 *  onSortChange?: (sort)=>void
 *  emptyIllustration?: ReactNode     // 自定义空状态插画
 *  exportOptions?: {
 *     enabled: boolean,
 *     filenamePrefix?: string,
 *     formats?: ('csv'|'json')[],
 *     exportScope?: 'all' | 'page', // 默认 all: 导出排序后全部（或选中）数据；page 仅当前页
 *     mapRow?: (row)=>any,          // 可选行转换（在格式化前）
 *     columnsFilter?: (col)=>boolean // 可选列过滤（默认导出全部非 actions 列）
 *   }
 *  columnVisibility?: {
 *     storageKey?: string // localStorage key 持久化 (默认 'datatable_columns')
 *     defaultVisibleKeys?: string[] // 默认显示列（未提供则全部）
 *     onChange?: (visibleKeys:string[])=>void
 *   }
 */
const DataTable = ({
  columns,
  data,
  emptyText = '暂无数据',
  actionsColumn,
  enableSelection = false,
  onSelectionChange,
  pageSize = 0,
  initialSort,
  onSortChange,
  emptyIllustration,
  exportOptions,
  columnVisibility,
}) => {
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort || null);

  // Reset selection if data changes
  useEffect(() => {
    setSelected(new Set());
    setPage(1);
  }, [data]);

  const toggleSelectAll = () => {
    if (selected.size === pagedData.length) {
      const cleared = new Set();
      setSelected(cleared);
      onSelectionChange && onSelectionChange([], []);
    } else {
      const all = new Set(pagedData.map(r => r.id || r.key));
      setSelected(all);
      const rows = pagedData;
      onSelectionChange && onSelectionChange(rows, Array.from(all));
    }
  };

  const toggleRow = (row) => {
    const id = row.id || row.key;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    if (onSelectionChange) {
      const rows = pagedData.filter(r => next.has(r.id || r.key));
      onSelectionChange(rows, Array.from(next));
    }
  };

  // ---------- 列显隐状态 ----------
  const storageKey = columnVisibility?.storageKey || 'datatable_columns';
  const allKeys = columns.map(c => c.key);
  const initialVisible = (() => {
    if (columnVisibility?.defaultVisibleKeys) return columnVisibility.defaultVisibleKeys.filter(k => allKeys.includes(k));
    try {
      const persisted = localStorage.getItem(storageKey);
      if (persisted) {
        const arr = JSON.parse(persisted);
        if (Array.isArray(arr)) return arr.filter(k => allKeys.includes(k));
      }
    } catch { /* ignore */ }
    return allKeys;
  })();
  const [visibleKeys, setVisibleKeys] = useState(initialVisible);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(visibleKeys)); } catch { /* ignore */ }
    columnVisibility?.onChange && columnVisibility.onChange(visibleKeys);
  }, [visibleKeys]);

  const effectiveColumns = useMemo(() => columns.filter(c => visibleKeys.includes(c.key)), [columns, visibleKeys]);

  const toggleColumn = (key) => {
    setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find(c => c.key === sort.key);
    if (!col) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === 'number' && typeof bv === 'number') return sort.direction === 'asc' ? av - bv : bv - av;
      // try to parse date
      const ad = Date.parse(av); const bd = Date.parse(bv);
      if (!isNaN(ad) && !isNaN(bd)) return sort.direction === 'asc' ? ad - bd : bd - ad;
      return sort.direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [data, sort, columns]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    if (pageSize <= 0) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageSize, currentPage]);

  const handleSort = (col) => {
    if (!col.sortable) return;
    setSort(prev => {
      if (!prev || prev.key !== col.key) {
        const next = { key: col.key, direction: 'asc' };
        onSortChange && onSortChange(next);
        return next;
      }
      const direction = prev.direction === 'asc' ? 'desc' : 'asc';
      const next = { key: col.key, direction };
      onSortChange && onSortChange(next);
      return next;
    });
  };

  const sortIndicator = (col) => {
    if (!col.sortable) return null;
    if (!sort || sort.key !== col.key) return <span style={{ opacity: 0.3 }}>⇅</span>;
    return <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // ---------- 导出逻辑 ----------
  const doExport = (format) => {
    if (!exportOptions?.enabled) return;
    const scope = exportOptions.exportScope || 'all';
    const baseRows = scope === 'page' ? pagedData : sortedData;
    // 如果有选择且启用选择，则只导出已选中的
    const rowsPool = enableSelection && selected.size > 0
      ? baseRows.filter(r => selected.has(r.id || r.key))
      : baseRows;
    const mapRow = exportOptions.mapRow || (r => r);
  const respectVisibility = exportOptions.respectVisibility;
  const baseCols = exportOptions.columnsFilter ? columns.filter(c => exportOptions.columnsFilter(c)) : columns;
  const colsForExport = respectVisibility && columnVisibility ? baseCols.filter(c => visibleKeys.includes(c.key)) : baseCols;
    const processedRows = rowsPool.map(r => mapRow(r));

    if (format === 'csv') {
      const headers = colsForExport.map(c => c.name.replace(/\"/g,'"')).join(',');
      const lines = processedRows.map(r => colsForExport.map(c => {
        const raw = r[c.key];
        let val = raw == null ? '' : String(raw);
        // 如果列定义有 exportValue 使用它
        if (typeof c.exportValue === 'function') {
          try { val = c.exportValue(r); } catch { /* ignore */ }
          val = val == null ? '' : String(val);
        }
        const needsQuote = /[",\n]/.test(val);
        val = val.replace(/"/g,'""');
        return needsQuote ? `"${val}"` : val;
      }).join(',')).join('\n');
      const csv = headers + '\n' + lines;
      triggerDownload(csv, (exportOptions.filenamePrefix || 'export') + '_' + timestamp() + '.csv', 'text/csv;charset=utf-8;');
    } else if (format === 'json') {
      const jsonRows = processedRows.map(r => {
        const o = {};
        colsForExport.forEach(c => {
          if (typeof c.exportValue === 'function') {
            try { o[c.key] = c.exportValue(r); } catch { o[c.key] = null; }
          } else {
            o[c.key] = r[c.key];
          }
        });
        return o;
      });
      const json = JSON.stringify(jsonRows, null, 2);
      triggerDownload(json, (exportOptions.filenamePrefix || 'export') + '_' + timestamp() + '.json', 'application/json;charset=utf-8;');
    }
  };

  const triggerDownload = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const timestamp = () => new Date().toISOString().replace(/[:.]/g,'-');

  const renderExportBar = () => {
    if (!exportOptions?.enabled) return null;
    const fmts = exportOptions.formats || ['csv','json'];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {fmts.includes('csv') && <Button size="small" onClick={() => doExport('csv')}>{t('datatable.export.csv')}</Button>}
        {fmts.includes('json') && <Button size="small" appearance="secondary" onClick={() => doExport('json')}>{t('datatable.export.json')}</Button>}
        {enableSelection && <span style={{ fontSize: 12, opacity: 0.7 }}>当前选择: {selected.size} 行</span>}
        {columnVisibility && (
          <Popover positioning="below-start">
            <PopoverTrigger disableButtonEnhancement>
              <Button size="small" appearance="outline">{t('datatable.column.config')}</Button>
            </PopoverTrigger>
            <PopoverSurface aria-label="列配置" style={{ maxWidth: 240 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {columns.map(col => (
                  <label key={col.key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                    /> {col.name}
                  </label>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <Button size="small" onClick={() => setVisibleKeys(allKeys)}>{t('datatable.column.selectAll')}</Button>
                  <Button size="small" appearance="secondary" onClick={() => setVisibleKeys([])}>{t('datatable.column.clear')}</Button>
                </div>
              </div>
            </PopoverSurface>
          </Popover>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {renderExportBar()}
      <Table size="medium" aria-label="data table">
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHeaderCell style={{ width: 40 }}>
                <Checkbox checked={pagedData.length>0 && selected.size === pagedData.length} indeterminate={selected.size>0 && selected.size < pagedData.length} onChange={toggleSelectAll} />
              </TableHeaderCell>
            )}
            {effectiveColumns.map(col => {
              const ariaSort = col.sortable ? (sort && sort.key === col.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined;
              return (
                <TableHeaderCell
                  key={col.key}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  onClick={() => handleSort(col)}
                  aria-sort={ariaSort}
                  role={col.sortable ? 'columnheader' : undefined}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.name} {sortIndicator(col)}
                  </span>
                </TableHeaderCell>
              );
            })}
            {actionsColumn && <TableHeaderCell>操作</TableHeaderCell>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={effectiveColumns.length + (actionsColumn ? 1 : 0) + (enableSelection ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--colorNeutralForeground3,#666)', padding: '32px 8px' }}>
                {emptyIllustration && <div style={{ marginBottom: 12 }}>{emptyIllustration}</div>}
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {pagedData.map(row => {
            const id = row.id || row.key;
            const checked = enableSelection && selected.has(id);
            return (
              <TableRow key={id} appearance={checked ? 'brand' : 'none'}>
                {enableSelection && (
                  <TableCell style={{ width: 40 }}>
                    <Checkbox checked={checked} onChange={() => toggleRow(row)} />
                  </TableCell>
                )}
                {effectiveColumns.map(col => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
                {actionsColumn && <TableCell>{actionsColumn(row)}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {pageSize > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>第 {currentPage} / {totalPages} 页 (共 {sortedData.length} 条)</span>
          <Button size="small" appearance="secondary" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>上一页</Button>
            <Button size="small" appearance="secondary" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
