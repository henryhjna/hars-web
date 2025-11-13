import type { Event } from '../../../types';

interface DisplayTabProps {
  event: Event;
  basicForm: {
    theme_color: string;
    banner_image_url: string;
    show_keynote: boolean;
    show_program: boolean;
    show_testimonials: boolean;
    show_photos: boolean;
    show_best_paper: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DisplayTab({ event, basicForm, onInputChange, onSubmit }: DisplayTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Display Settings</h2>
      </div>

      {/* Theme Color */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Color</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Theme Color:</label>
            <input
              type="color"
              name="theme_color"
              value={basicForm.theme_color}
              onChange={onInputChange}
              className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              name="theme_color"
              value={basicForm.theme_color}
              onChange={onInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="#3B82F6"
            />
          </div>
        </div>
      </div>

      {/* Banner Image URL */}
      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Image</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image URL</label>
            <input
              type="text"
              name="banner_image_url"
              value={basicForm.banner_image_url}
              onChange={onInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          {basicForm.banner_image_url && (
            <div className="max-w-2xl">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                src={basicForm.banner_image_url}
                alt="Event banner preview"
                className="w-full rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Display Options */}
      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Options</h3>
        <p className="text-sm text-gray-600 mb-4">
          Control which sections are visible on the event page
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'show_keynote', label: 'Show Keynote Speakers' },
            { name: 'show_program', label: 'Show Program' },
            { name: 'show_testimonials', label: 'Show Testimonials' },
            { name: 'show_photos', label: 'Show Photos' },
            { name: 'show_best_paper', label: 'Show Best Paper' },
          ].map((option) => (
            <div
              key={option.name}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                basicForm[option.name as keyof typeof basicForm]
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                name={option.name}
                checked={basicForm[option.name as keyof typeof basicForm] as boolean}
                onChange={onInputChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700 cursor-pointer select-none">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Display Settings
        </button>
      </div>
    </form>
  );
}
