import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { SearchBar } from '@/components/common/SearchBar';
import { localStorageService } from '@/services/localStorage';
import { formatDate, getTimeAgo } from '@/utils/formatting';
import { Complaint, Student } from '@/types';

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    setComplaints(localStorageService.getComplaints());
    setStudents(localStorageService.getStudents());
  }, []);

  const filteredComplaints = complaints
    .filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (searchTerm) {
        const student = students.find((s) => s.id === c.studentId);
        return (
          student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.fullName || 'Unknown Student';
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaint) return;

    localStorageService.updateComplaint(selectedComplaint.id, {
      status: 'Resolved',
      resolvedDate: new Date().toISOString(),
      resolutionNotes: resolutionNotes,
    });

    setComplaints(localStorageService.getComplaints());
    setShowResolveModal(false);
    setResolutionNotes('');
    setSelectedComplaint(null);
  };

  const getPendingCount = () => complaints.filter((c) => c.status === 'Pending').length;
  const getResolvedCount = () => complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600 mt-2">Manage student complaints and grievances</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            statusFilter === 'All' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => setStatusFilter('All')}
        >
          <p className="text-gray-600 text-sm">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
        </div>
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            statusFilter === 'Pending' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
          }`}
          onClick={() => setStatusFilter('Pending')}
        >
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{getPendingCount()}</p>
        </div>
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            statusFilter === 'Resolved' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
          onClick={() => setStatusFilter('Resolved')}
        >
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{getResolvedCount()}</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by student name or complaint type..."
        />
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{complaint.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Student:</span> {getStudentName(complaint.studentId)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    label={complaint.urgency}
                    status={
                      complaint.urgency === 'High'
                        ? 'urgent'
                        : complaint.urgency === 'Medium'
                        ? 'medium'
                        : 'low'
                    }
                  />
                  <Badge
                    label={complaint.status}
                    status={complaint.status === 'Pending' ? 'pending' : 'completed'}
                  />
                </div>
              </div>

              <p className="text-gray-700 mb-4">{complaint.description}</p>

              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-600">Reported {getTimeAgo(complaint.reportedDate)}</p>

                {complaint.status === 'Pending' ? (
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowResolveModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark as Resolved
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Resolved on {formatDate(complaint.resolvedDate!)}</span>
                  </div>
                )}
              </div>

              {complaint.status === 'Resolved' && complaint.resolutionNotes && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Resolution:</span> {complaint.resolutionNotes}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No complaints found</p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setResolutionNotes('');
          setSelectedComplaint(null);
        }}
        title="Resolve Complaint"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the complaint was resolved..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowResolveModal(false);
                setResolutionNotes('');
                setSelectedComplaint(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleResolveComplaint}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Resolve Complaint
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
