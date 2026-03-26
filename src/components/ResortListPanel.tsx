import React, { useState } from 'react';
import { Copy, Check, X, List } from 'lucide-react';
import type { ListEntry, ResortLists } from '../hooks/useResortLists';

interface ResortListPanelProps {
  lists: ResortLists;
  readonly: boolean;
  open: boolean;
  onToggle: () => void;
  onRemove: (list: 'see' | 'avoid', id: string) => void;
  onNoteChange: (list: 'see' | 'avoid', id: string, note: string) => void;
  getShareUrl: (readonlyMode: boolean) => string;
}

function ListSection({
  title,
  entries,
  readonly,
  onRemove,
  onNoteChange,
  color,
}: {
  title: string;
  entries: ListEntry[];
  readonly: boolean;
  onRemove: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  color: 'green' | 'red';
}) {
  const colorClasses = {
    green: {
      header: 'text-green-800 border-green-300',
      badge: 'bg-green-100 text-green-800',
      link: 'text-green-700 hover:text-green-900',
      textarea: 'border-green-200 focus:border-green-400',
    },
    red: {
      header: 'text-red-800 border-red-300',
      badge: 'bg-red-100 text-red-800',
      link: 'text-red-700 hover:text-red-900',
      textarea: 'border-red-200 focus:border-red-400',
    },
  }[color];

  if (entries.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className={`font-semibold text-sm mb-2 pb-1 border-b ${colorClasses.header}`}>
        {title}{' '}
        <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${colorClasses.badge}`}>
          {entries.length}
        </span>
      </h3>
      <ul className="space-y-3">
        {entries.map(entry => (
          <li key={entry.id} className="bg-gray-50 rounded border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <a
                href={`#card-${entry.id}`}
                className={`font-medium text-sm ${colorClasses.link} hover:underline`}
              >
                {entry.name}
              </a>
              {!readonly && (
                <button
                  onClick={() => onRemove(entry.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${entry.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {!readonly ? (
              <div className="mt-2">
                <textarea
                  value={entry.note}
                  onChange={e => onNoteChange(entry.id, e.target.value)}
                  placeholder="Add a note..."
                  maxLength={280}
                  rows={2}
                  className={`w-full text-xs p-1.5 border rounded resize-none focus:outline-none ${colorClasses.textarea}`}
                />
                <div className="text-right text-xs text-gray-400">{entry.note.length}/280</div>
              </div>
            ) : (
              entry.note && <p className="mt-1 text-xs text-gray-600 italic">{entry.note}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const ResortListPanel: React.FC<ResortListPanelProps> = ({
  lists,
  readonly,
  open,
  onToggle,
  onRemove,
  onNoteChange,
  getShareUrl,
}) => {
  const [shareReadonly, setShareReadonly] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareUrl(shareReadonly));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSee = lists.see.length;
  const totalAvoid = lists.avoid.length;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-300 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Floating tab trigger */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-full left-0 flex flex-col items-center gap-1.5 bg-white border border-r-0 border-gray-300 rounded-l-lg px-2 py-4 shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Toggle resort lists"
      >
        <List size={16} className="text-gray-600" />
        {totalSee > 0 && (
          <span className="text-xs font-semibold px-1 py-0.5 bg-green-100 text-green-800 rounded">
            {totalSee}
          </span>
        )}
        {totalAvoid > 0 && (
          <span className="text-xs font-semibold px-1 py-0.5 bg-red-100 text-red-800 rounded">
            {totalAvoid}
          </span>
        )}
      </button>

      {/* Drawer content */}
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">My Resort Lists</h2>
          {readonly && (
            <span className="text-xs text-gray-500 italic">read-only</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ListSection
            title="Places to See"
            entries={lists.see}
            readonly={readonly}
            onRemove={id => onRemove('see', id)}
            onNoteChange={(id, note) => onNoteChange('see', id, note)}
            color="green"
          />
          <ListSection
            title="Places to Avoid"
            entries={lists.avoid}
            readonly={readonly}
            onRemove={id => onRemove('avoid', id)}
            onNoteChange={(id, note) => onNoteChange('avoid', id, note)}
            color="red"
          />
        </div>

        {!readonly && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-medium text-gray-700 mb-2">Share this list:</p>
            <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareReadonly}
                onChange={e => setShareReadonly(e.target.checked)}
                className="w-auto"
              />
              Share as read-only
            </label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-resort-blue text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResortListPanel;
