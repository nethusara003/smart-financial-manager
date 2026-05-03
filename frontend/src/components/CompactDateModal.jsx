import React from 'react';
import {
  DATE_RANGE_OPTIONS,
  getPresetDateBounds,
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
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="bg-[#0D1117] rounded-xl p-3 shadow-[0_8px_24px_rgba(2,6,23,0.6)] backdrop-blur-sm">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">Custom Date Range</p>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onPreset('week')} className="rounded-lg border border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/5">Last 7 days</button>
          <button type="button" onClick={() => onPreset('thisMonth')} className="rounded-lg border border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/5">This month</button>
          <button type="button" onClick={() => onPreset('thisYear')} className="rounded-lg border border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/5">This year</button>
          <button type="button" onClick={() => onPreset('pastYear')} className="rounded-lg border border-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/5">Past year</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
            From
            <input type="date" value={formatDateInputValue(draft.startDate)} onChange={handleInputChange('startDate')} className="mt-1 w-full rounded-lg border border-white/5 bg-transparent px-2.5 py-1.5 text-[11px] text-white" />
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
            To
            <input type="date" value={formatDateInputValue(draft.endDate)} onChange={handleInputChange('endDate')} className="mt-1 w-full rounded-lg border border-white/5 bg-transparent px-2.5 py-1.5 text-[11px] text-white" />
          </label>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:bg-white/5">Cancel</button>
          <button type="button" onClick={onApply} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-cyan-600">Apply</button>
        </div>
      </div>
    </div>
  );
}
