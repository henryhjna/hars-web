import type { EventContent, CommitteeMember } from '../../../types';

interface ContentTabProps {
  contentForm: EventContent;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddCommitteeMember: (type: 'academic_committee' | 'organizing_committee') => void;
  onUpdateCommitteeMember: (
    type: 'academic_committee' | 'organizing_committee',
    index: number,
    field: keyof CommitteeMember,
    value: string
  ) => void;
  onRemoveCommitteeMember: (type: 'academic_committee' | 'organizing_committee', index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onContentFormChange: (updates: Partial<EventContent>) => void;
}

export default function ContentTab({
  contentForm,
  onInputChange,
  onAddCommitteeMember,
  onUpdateCommitteeMember,
  onRemoveCommitteeMember,
  onSubmit,
  onContentFormChange,
}: ContentTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-4xl">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Event Content & Venue</h2>
        <p className="text-gray-600">Manage dynamic content sections and venue information displayed on the event page.</p>

        {/* Special Practitioner Sessions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Practitioner Sessions
          </label>
          <textarea
            name="practitioner_sessions"
            value={contentForm.practitioner_sessions}
            onChange={onInputChange}
            rows={6}
            placeholder="Enter information about practitioner sessions..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Submission Guidelines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Guidelines
          </label>
          <textarea
            name="submission_guidelines"
            value={contentForm.submission_guidelines}
            onChange={onInputChange}
            rows={8}
            placeholder="Enter submission guidelines..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Awards */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Awards Information
          </label>
          <textarea
            name="awards"
            value={contentForm.awards}
            onChange={onInputChange}
            rows={4}
            placeholder="Enter information about awards..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Academic Committee */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Academic Committee
            </label>
            <button
              type="button"
              onClick={() => onAddCommitteeMember('academic_committee')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>
          <div className="space-y-4">
            {contentForm.academic_committee?.map((member, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-md space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) =>
                      onUpdateCommitteeMember('academic_committee', index, 'name', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Affiliation"
                    value={member.affiliation}
                    onChange={(e) =>
                      onUpdateCommitteeMember('academic_committee', index, 'affiliation', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Research Area"
                    value={member.area || ''}
                    onChange={(e) =>
                      onUpdateCommitteeMember('academic_committee', index, 'area', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCommitteeMember('academic_committee', index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Member
                </button>
              </div>
            ))}
            {(!contentForm.academic_committee || contentForm.academic_committee.length === 0) && (
              <p className="text-gray-500 text-sm">No academic committee members added yet.</p>
            )}
          </div>
        </div>

        {/* Organizing Committee */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Organizing Committee
            </label>
            <button
              type="button"
              onClick={() => onAddCommitteeMember('organizing_committee')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>
          <div className="space-y-4">
            {contentForm.organizing_committee?.map((member, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-md space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) =>
                      onUpdateCommitteeMember('organizing_committee', index, 'name', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Affiliation"
                    value={member.affiliation}
                    onChange={(e) =>
                      onUpdateCommitteeMember('organizing_committee', index, 'affiliation', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={member.role || ''}
                    onChange={(e) =>
                      onUpdateCommitteeMember('organizing_committee', index, 'role', e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCommitteeMember('organizing_committee', index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Member
                </button>
              </div>
            ))}
            {(!contentForm.organizing_committee || contentForm.organizing_committee.length === 0) && (
              <p className="text-gray-500 text-sm">No organizing committee members added yet.</p>
            )}
          </div>
        </div>

        {/* Venue Information */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Venue Information</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                value={contentForm.venue_info?.name || ''}
                onChange={(e) => onContentFormChange({
                  venue_info: {
                    ...contentForm.venue_info,
                    name: e.target.value
                  }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Hanyang University Business School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={contentForm.venue_info?.address || ''}
                onChange={(e) => onContentFormChange({
                  venue_info: {
                    ...contentForm.venue_info,
                    address: e.target.value
                  }
                })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessibility Info (one per line)
              </label>
              <textarea
                value={(contentForm.venue_info?.accessibility || []).join('\n')}
                onChange={(e) => onContentFormChange({
                  venue_info: {
                    ...contentForm.venue_info,
                    accessibility: e.target.value.split('\n').filter(line => line.trim())
                  }
                })}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g.,&#10;Incheon International Airport: 60 minutes by AREX&#10;Hanyang University Station: Seoul Metro Line 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information (one per line)
              </label>
              <textarea
                value={(contentForm.venue_info?.contact || []).join('\n')}
                onChange={(e) => onContentFormChange({
                  venue_info: {
                    ...contentForm.venue_info,
                    contact: e.target.value.split('\n').filter(line => line.trim())
                  }
                })}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g.,&#10;Website: www.hanyanghars.com&#10;Email: contact@hanyanghars.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Content & Venue
        </button>
      </div>
    </form>
  );
}
