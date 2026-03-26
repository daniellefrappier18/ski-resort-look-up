import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, X } from 'lucide-react';
import type { ListEntry, ResortLists } from '../hooks/useResortLists';

interface ResortListPanelProps {
  lists: ResortLists;
  readonly: boolean;
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
    <div className="mb-4">
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
  onRemove,
  onNoteChange,
  getShareUrl,
}) => {
  const [expanded, setExpanded] = useState(true);
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Always-visible bar / handle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-t border-gray-300 shadow-md hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
        aria-label="Toggle resort lists"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-gray-800">
          My Resort Lists
          {totalSee > 0 && (
            <span className="text-xs font-normal px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
              {totalSee} to see
            </span>
          )}
          {totalAvoid > 0 && (
            <span className="text-xs font-normal px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
              {totalAvoid} to avoid
            </span>
          )}
        </span>
        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* Expandable drawer content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? '420px' : '0px' }}
      >
        <div className="bg-white border-x border-b border-gray-300 shadow-xl overflow-y-auto" style={{ maxHeight: '420px' }}>
          <div className="p-4 max-w-4xl mx-auto">
            {readonly && (
              <div className="mb-3 text-xs text-center text-gray-500 italic bg-gray-100 rounded px-3 py-1.5">
                Viewing a shared list (read-only)
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-4">
                <p className="text-xs font-medium text-gray-700">Share this list:</p>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareReadonly}
                    onChange={e => setShareReadonly(e.target.checked)}
                    className="w-auto"
                  />
                  Read-only
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
      </div>
    </div>
  );
};

export default ResortListPanel;
