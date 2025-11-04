import { useState, useEffect, useMemo } from 'react';
import { Plus, Download, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { SearchBar } from '@/components/common/SearchBar';
import { localStorageService } from '@/services/localStorage';
import { formatCurrency, formatDate, exportToCSV } from '@/utils/formatting';
import { Student } from '@/types';

export default function Payments() {
  const [students, setStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [newPayment, setNewPayment] = useState({
    studentId: '',
    transactionId: '',
    paidAmount: 30000,
  });

  useEffect(() => {
    setStudents(localStorageService.getStudents());
  }, []);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (statusFilter !== 'All' && s.paymentStatus !== statusFilter) return false;
        if (searchTerm) {
          return (
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (a.paymentStatus === b.paymentStatus) {
          return (
            new Date(b.paymentDetails?.paidDate || 0).getTime() -
            new Date(a.paymentDetails?.paidDate || 0).getTime()
          );
        }
        return a.paymentStatus === 'Paid' ? -1 : 1;
      });
  }, [students, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const paidCount = students.filter((s) => s.paymentStatus === 'Paid').length;
    const unpaidCount = students.filter((s) => s.paymentStatus === 'Unpaid').length;
    const totalCollected = students.reduce((sum, s) => {
      return sum + (s.paymentDetails?.paidAmount || 0);
    }, 0);

    return {
      paidCount,
      unpaidCount,
      totalCollected,
      totalExpected: students.length * 30000,
    };
  }, [students]);

  const handleAddPayment = () => {
    if (!newPayment.studentId || !newPayment.transactionId) return;

    const student = students.find((s) => s.id === newPayment.studentId);
    if (!student) return;

    localStorageService.updateStudent(newPayment.studentId, {
      paymentStatus: 'Paid',
      paymentDetails: {
        transactionId: newPayment.transactionId,
        paidAmount: newPayment.paidAmount,
        paidDate: new Date().toISOString(),
      },
    });

    setStudents(localStorageService.getStudents());
    setShowAddPaymentModal(false);
    setNewPayment({
      studentId: '',
      transactionId: '',
      paidAmount: 30000,
    });
  };

  const handleDownloadReport = () => {
    const reportData = students.map((student) => ({
      'Roll Number': student.rollNumber,
      'Student Name': student.fullName,
      'Email': student.email,
      'Phone': student.mobileNumber,
      'Payment Status': student.paymentStatus,
      'Amount Paid': student.paymentDetails?.paidAmount || 0,
      'Transaction ID': student.paymentDetails?.transactionId || 'N/A',
      'Payment Date': student.paymentDetails?.paidDate || 'N/A',
      'Room': student.roomId || 'Not Allocated',
    }));

    exportToCSV(reportData, 'payment_report');
  };

  const recentPayments = students
    .filter((s) => s.paymentStatus === 'Paid' && s.paymentDetails?.paidDate)
    .sort((a, b) => {
      const dateA = new Date(a.paymentDetails?.paidDate || 0);
      const dateB = new Date(b.paymentDetails?.paidDate || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage student hostel fee payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.paidCount}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Unpaid</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.unpaidCount}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 shadow">
          <p className="text-gray-600 text-sm">Total Collected</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.totalCollected)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name or roll number..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          {['All', 'Paid', 'Unpaid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as 'All' | 'Paid' | 'Unpaid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Students Payment Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll Number</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{student.rollNumber}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatCurrency(student.paymentDetails?.paidAmount || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={student.paymentStatus}
                      status={student.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.paymentDetails?.transactionId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.paymentDetails?.paidDate ? formatDate(student.paymentDetails.paidDate) : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No students found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {recentPayments.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(student.paymentDetails?.paidAmount || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.paymentDetails?.paidDate ? formatDate(student.paymentDetails.paidDate) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={() => {
          setShowAddPaymentModal(false);
          setNewPayment({
            studentId: '',
            transactionId: '',
            paidAmount: 30000,
          });
        }}
        title="Add Payment"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
            <select
              value={newPayment.studentId}
              onChange={(e) =>
                setNewPayment((prev) => ({
                  ...prev,
                  studentId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select student...</option>
              {students
                .filter((s) => s.paymentStatus === 'Unpaid')
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.rollNumber})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
            <input
              type="number"
              value={newPayment.paidAmount}
              onChange={(e) =>
                setNewPayment((prev) => ({
                  ...prev,
                  paidAmount: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
            <input
              type="text"
              value={newPayment.transactionId}
              onChange={(e) =>
                setNewPayment((prev) => ({
                  ...prev,
                  transactionId: e.target.value,
                }))
              }
              placeholder="TXN123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddPaymentModal(false);
                setNewPayment({
                  studentId: '',
                  transactionId: '',
                  paidAmount: 30000,
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
