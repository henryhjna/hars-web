import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import noticeService, { type NoticePayload } from '../../services/notice.service';
import type { SiteNotice, NoticeSeverity } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const severityOptions: { value: NoticeSeverity; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

const severityBadge: Record<NoticeSeverity, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const emptyForm: NoticePayload = {
  title: '',
  body: '',
  severity: 'info',
  is_active: false,
};

export default function AdminNotices() {
  const [notices, setNotices] = useState<SiteNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoticePayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await noticeService.getAll();
      setNotices(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (notice: SiteNotice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      body: notice.body,
      severity: notice.severity,
      is_active: notice.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await noticeService.update(editingId, formData);
      } else {
        await noticeService.create(formData);
      }
      setShowModal(false);
      await loadNotices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (notice: SiteNotice) => {
    if (!confirm(`Delete notice "${notice.title}"?`)) return;
    try {
      await noticeService.delete(notice.id);
      await loadNotices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete notice');
    }
  };

  const handleToggleActive = async (notice: SiteNotice) => {
    try {
      await noticeService.update(notice.id, { is_active: !notice.is_active });
      await loadNotices();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update notice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Site Notices</h1>
          <p className="text-gray-600 mt-1">
            Manage the popup notice shown to visitors on the home page. Only one notice can be active at a time.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Notice
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No notices yet. Click "New Notice" to create one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{notice.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${severityBadge[notice.severity]}`}>
                      {notice.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notice.is_active}
                        onChange={() => handleToggleActive(notice)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {notice.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(notice.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => handleEdit(notice)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <Pencil className="w-4 h-4 inline" /> Edit
                    </button>
                    <button onClick={() => handleDelete(notice)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4 inline" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Notice' : 'New Notice'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={255}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Plain text. Line breaks are preserved. Wrap text with <strong>...</strong> for bold."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use <code>&lt;strong&gt;text&lt;/strong&gt;</code> for bold. Other HTML is shown as plain text.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as NoticeSeverity })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {severityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Active (will auto-deactivate any other active notice)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
