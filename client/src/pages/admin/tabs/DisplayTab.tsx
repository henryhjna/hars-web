import { useState } from 'react';
import type { Event } from '../../../types';
import axios from 'axios';

interface DisplayTabProps {
  event: Event;
  basicForm: {
    theme_color: string;
    banner_image_url: string;
    show_overview: boolean;
    show_practitioner_sessions: boolean;
    show_submission_guidelines: boolean;
    show_awards: boolean;
    show_committees: boolean;
    show_venue: boolean;
    show_program: boolean;
    show_keynote: boolean;
    show_photos: boolean;
    show_testimonials: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBannerUploaded: (url: string) => void;
}

export default function DisplayTab({ event, basicForm, onInputChange, onSubmit, onBannerUploaded }: DisplayTabProps) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setbannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setbannerError(`File size exceeds 20MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setbannerError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setbannerError('');
    setBannerFile(file);
  };

  const handleBannerUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFile) {
      setbannerError('Please select a banner image file');
      return;
    }

    try {
      setUploadingBanner(true);
      setbannerError('');
      setBannerSuccess('');

      const formData = new FormData();
      formData.append('banner', bannerFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${event.id}/banner`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBannerSuccess('Banner uploaded successfully!');
      onBannerUploaded(response.data.data.banner_image_url);
      setBannerFile(null);

      // Reset file input
      const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setbannerError(err.response?.data?.message || 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Display Settings</h2>
      </div>

      {/* Theme Color */}
      <form onSubmit={onSubmit}>
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

        {/* Display Options */}
        <div className="pt-8 border-t border-gray-200 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Display Options</h3>
          <p className="text-sm text-gray-600 mb-4">
            Control which sections are visible on the event page
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'show_overview', label: 'Show Conference Overview' },
              { name: 'show_practitioner_sessions', label: 'Show Practitioner Sessions' },
              { name: 'show_submission_guidelines', label: 'Show Submission Guidelines' },
              { name: 'show_awards', label: 'Show Awards' },
              { name: 'show_committees', label: 'Show Committees' },
              { name: 'show_venue', label: 'Show Venue Information' },
              { name: 'show_program', label: 'Show Program Schedule' },
              { name: 'show_keynote', label: 'Show Keynote Speakers' },
              { name: 'show_photos', label: 'Show Photos' },
              { name: 'show_testimonials', label: 'Show Testimonials' },
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

        {/* Save Button for Theme and Display Options */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Display Settings
          </button>
        </div>
      </form>

      {/* Banner Image Upload - Separate Form */}
      <form onSubmit={handleBannerUpload} className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Image</h3>

        {bannerError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {bannerError}
          </div>
        )}

        {bannerSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {bannerSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Banner Image (Max 20MB, JPEG/PNG/WebP)
            </label>
            <input
              id="banner-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleBannerFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {bannerFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {bannerFile.name} ({(bannerFile.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
          </div>

          {/* Current Banner Preview */}
          {basicForm.banner_image_url && (
            <div className="max-w-2xl">
              <p className="text-sm text-gray-600 mb-2">Current Banner:</p>
              <img
                src={basicForm.banner_image_url}
                alt="Current event banner"
                className="w-full rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!bannerFile || uploadingBanner}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
