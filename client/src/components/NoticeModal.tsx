import { useState } from 'react';
import { AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import Button from './ui/Button';
import type { SiteNotice } from '../types';

interface NoticeModalProps {
  notice: SiteNotice;
  onClose: (dontShowAgain: boolean) => void;
}

const severityStyles = {
  info: { icon: Info, bg: 'bg-blue-100', fg: 'text-blue-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-100', fg: 'text-amber-600' },
  critical: { icon: AlertOctagon, bg: 'bg-red-100', fg: 'text-red-600' },
};

// Render plain text with <strong>...</strong> support and preserved line breaks.
function renderBody(body: string) {
  const parts = body.split(/(<strong>.*?<\/strong>)/gi);
  return parts.map((part, i) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/i);
    if (match) return <strong key={i}>{match[1]}</strong>;
    return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
  });
}

export default function NoticeModal({ notice, onClose }: NoticeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const style = severityStyles[notice.severity] || severityStyles.info;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={() => onClose(dontShowAgain)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notice"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${style.fg}`} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{notice.title}</h2>
        </div>
        <div className="space-y-2 text-gray-700 leading-relaxed">{renderBody(notice.body)}</div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Don't show this again</span>
          </label>
          <Button variant="primary" className="w-full" onClick={() => onClose(dontShowAgain)}>
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
