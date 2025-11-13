import type { Event } from '../../../types';

interface DisplayTabProps {
  event: Event;
  onEditStats: () => void;
}

export default function DisplayTab({ event, onEditStats }: DisplayTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Display Settings & Statistics</h2>
        <button
          onClick={onEditStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Statistics
        </button>
      </div>

      <div className="space-y-8">
        {/* Highlight Statistics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Highlight Statistics</h3>
          {event.highlight_stats && Object.keys(event.highlight_stats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(event.highlight_stats).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">{String(value)}</div>
                  <div className="text-sm text-gray-600 capitalize mt-1">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No statistics yet. Click "Edit Statistics" to add some!
            </p>
          )}
        </div>

        {/* Display Options Summary */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Display Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'show_keynote', label: 'Show Keynote Speakers' },
              { key: 'show_program', label: 'Show Program' },
              { key: 'show_testimonials', label: 'Show Testimonials' },
              { key: 'show_photos', label: 'Show Photos' },
              { key: 'show_best_paper', label: 'Show Best Paper' },
            ].map((option) => (
              <div
                key={option.key}
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  event[option.key as keyof Event]
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded ${
                    event[option.key as keyof Event] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            To change these settings, go to the "Basic Info" tab.
          </p>
        </div>

        {/* Theme Preview */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Preview</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Theme Color:</span>
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: event.theme_color }}
              />
              <span className="text-sm font-mono text-gray-700">{event.theme_color}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            To change the theme color, go to the "Basic Info" tab.
          </p>
        </div>

        {/* Banner Preview */}
        {event.banner_image_url && (
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Preview</h3>
            <div className="max-w-2xl">
              <img
                src={event.banner_image_url}
                alt="Event banner"
                className="w-full rounded-lg shadow-md"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              To change the banner image, go to the "Basic Info" tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
