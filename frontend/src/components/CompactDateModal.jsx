import React from 'react';
import {
  DATE_RANGE_OPTIONS,
  formatDateInputValue,
} from '../utils/dateRangeFilter';

export default function CompactDateModal({
  draft,
  onDraftChange,
  onApply,
  onCancel,
  onPreset,
}) {
  const handleInputChange = (field) => (e) => {
    onDraftChange(field, e.target.value);
  };

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] rounded-xl border border-light-border-default dark:border-white/5">
      <div className="rounded-xl bg-light-surface-secondary dark:bg-[#0D1117] p-3 shadow-[0_8px_24px_rgba(2,6,23,0.6)] backdrop-blur-sm">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-light-text-secondary dark:text-white/60">Custom Date Range</p>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onPreset('week')} className="rounded-lg border border-light-border-default dark:border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-light-text-primary dark:text-white hover:bg-light-bg-accent dark:hover:bg-white/5">Last 7 days</button>
          <button type="button" onClick={() => onPreset('thisMonth')} className="rounded-lg border border-light-border-default dark:border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-light-text-primary dark:text-white hover:bg-light-bg-accent dark:hover:bg-white/5">This month</button>
          <button type="button" onClick={() => onPreset('thisYear')} className="rounded-lg border border-light-border-default dark:border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-light-text-primary dark:text-white hover:bg-light-bg-accent dark:hover:bg-white/5">This year</button>
          <button type="button" onClick={() => onPreset('pastYear')} className="rounded-lg border border-light-border-default dark:border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-light-text-primary dark:text-white hover:bg-light-bg-accent dark:hover:bg-white/5">Past year</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-light-text-secondary dark:text-white/60">
            From
            <input type="date" value={formatDateInputValue(draft.startDate)} onChange={handleInputChange('startDate')} className="mt-1 w-full rounded-lg border border-light-border-default dark:border-white/5 bg-light-surface-primary dark:bg-transparent px-2.5 py-1.5 text-[11px] text-light-text-primary dark:text-white" />
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-light-text-secondary dark:text-white/60">
            To
            <input type="date" value={formatDateInputValue(draft.endDate)} onChange={handleInputChange('endDate')} className="mt-1 w-full rounded-lg border border-light-border-default dark:border-white/5 bg-light-surface-primary dark:bg-transparent px-2.5 py-1.5 text-[11px] text-light-text-primary dark:text-white" />
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-light-border-default dark:border-white/5 px-3 py-1.5 text-[11px] font-semibold text-light-text-secondary dark:text-white/60 hover:bg-light-bg-accent dark:hover:bg-white/5">Cancel</button>
          <button type="button" onClick={onApply} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-cyan-600">Apply</button>
        </div>
      </div>
    </div>
  );
}
