import type { ViewMode } from '../../hooks/useResponsiveViewMode';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('table')}
        className={`p-2 rounded ${mode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        title="Table View"
        aria-label="Table View"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
        </svg>
      </button>
      <button
        onClick={() => onChange('card')}
        className={`p-2 rounded ${mode === 'card' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
        title="Card View"
        aria-label="Card View"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  );
}
