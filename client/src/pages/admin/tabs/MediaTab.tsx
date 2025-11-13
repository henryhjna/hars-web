import type { EventPhoto, KeynoteSpeaker, Testimonial } from '../../../types';

interface MediaTabProps {
  photos: EventPhoto[];
  speakers: KeynoteSpeaker[];
  testimonials: Testimonial[];
  onAddPhoto: () => void;
  onDeletePhoto: (photoId: string) => void;
  onAddSpeaker: () => void;
  onDeleteSpeaker: (speakerId: string) => void;
  onAddTestimonial: () => void;
  onDeleteTestimonial: (testimonialId: string) => void;
}

export default function MediaTab({
  photos,
  speakers,
  testimonials,
  onAddPhoto,
  onDeletePhoto,
  onAddSpeaker,
  onDeleteSpeaker,
  onAddTestimonial,
  onDeleteTestimonial,
}: MediaTabProps) {
  return (
    <div className="space-y-12">
      {/* Photos Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Event Photos</h2>
          <button
            onClick={onAddPhoto}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Photo
          </button>
        </div>

        {photos.length === 0 ? (
          <p className="text-gray-600">No photos yet. Add your first photo!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {photo.is_highlight && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Highlight
                  </span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
                {photo.caption && (
                  <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Speakers Section */}
      <div className="pt-12 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Keynote Speakers</h2>
          <button
            onClick={onAddSpeaker}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Speaker
          </button>
        </div>

        {speakers.length === 0 ? (
          <p className="text-gray-600">No speakers yet. Add your first speaker!</p>
        ) : (
          <div className="space-y-4">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                {speaker.photo_url && (
                  <img
                    src={speaker.photo_url}
                    alt={speaker.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{speaker.name}</h3>
                  {speaker.title && <p className="text-sm text-gray-600">{speaker.title}</p>}
                  {speaker.affiliation && (
                    <p className="text-sm text-gray-600">{speaker.affiliation}</p>
                  )}
                  {speaker.topic && (
                    <p className="mt-2 text-sm font-medium">
                      Topic: {speaker.topic}
                    </p>
                  )}
                  {speaker.presentation_time && (
                    <p className="text-sm text-gray-600">Time: {speaker.presentation_time}</p>
                  )}
                  {speaker.bio && <p className="mt-2 text-sm text-gray-700">{speaker.bio}</p>}
                </div>
                <button
                  onClick={() => onDeleteSpeaker(speaker.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 self-start"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="pt-12 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Testimonials</h2>
          <button
            onClick={onAddTestimonial}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Testimonial
          </button>
        </div>

        {testimonials.length === 0 ? (
          <p className="text-gray-600">No testimonials yet. Add your first testimonial!</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`border rounded-lg p-4 ${
                  testimonial.is_featured ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {testimonial.is_featured && (
                  <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                    Featured
                  </span>
                )}
                <p className="text-gray-700 italic">"{testimonial.testimonial_text}"</p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    — {testimonial.author_name}
                    {testimonial.author_affiliation && `, ${testimonial.author_affiliation}`}
                  </p>
                  <button
                    onClick={() => onDeleteTestimonial(testimonial.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
