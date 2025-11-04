import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Users, DollarSign, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { localStorageService } from '@/services/localStorage';
import { formatCurrency, exportToCSV } from '@/utils/formatting';
import { Room, Student, MaintenanceRequest, Complaint } from '@/types';

export default function Reports() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    setRooms(localStorageService.getRooms());
    setStudents(localStorageService.getStudents());
    setMaintenance(localStorageService.getMaintenanceRequests());
    setComplaints(localStorageService.getComplaints());
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const allocatedStudents = students.filter((s) => s.roomId).length;
    const paidStudents = students.filter((s) => s.paymentStatus === 'Paid').length;
    const unpaidStudents = students.filter((s) => s.paymentStatus === 'Unpaid').length;

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
    const emptyRooms = rooms.filter((r) => r.status === 'Empty').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

    const totalCollected = students.reduce((sum, s) => sum + (s.paymentDetails?.paidAmount || 0), 0);
    const totalExpected = students.length * 30000;
    const pendingAmount = totalExpected - totalCollected;

    const pendingMaintenance = maintenance.filter((m) => m.status === 'Pending').length;
    const inProgressMaintenance = maintenance.filter((m) => m.status === 'In Progress').length;
    const resolvedMaintenance = maintenance.filter((m) => m.status === 'Resolved').length;

    const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;

    return {
      totalStudents,
      allocatedStudents,
      paidStudents,
      unpaidStudents,
      totalRooms,
      occupiedRooms,
      emptyRooms,
      maintenanceRooms,
      totalCollected,
      totalExpected,
      pendingAmount,
      pendingMaintenance,
      inProgressMaintenance,
      resolvedMaintenance,
      pendingComplaints,
      resolvedComplaints,
    };
  }, [students, rooms, maintenance, complaints]);

  // Data for charts
  const paymentChartData = [
    { name: 'Paid', value: stats.paidStudents, fill: '#10b981' },
    { name: 'Unpaid', value: stats.unpaidStudents, fill: '#ef4444' },
  ];

  const roomStatusData = [
    { name: 'Occupied', value: stats.occupiedRooms, fill: '#a855f7' },
    { name: 'Empty', value: stats.emptyRooms, fill: '#9ca3af' },
    { name: 'Maintenance', value: stats.maintenanceRooms, fill: '#f97316' },
  ];

  const maintenanceData = [
    { name: 'Pending', value: stats.pendingMaintenance, fill: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgressMaintenance, fill: '#3b82f6' },
    { name: 'Resolved', value: stats.resolvedMaintenance, fill: '#10b981' },
  ];

  const complaintData = [
    { name: 'Pending', value: stats.pendingComplaints, fill: '#f59e0b' },
    { name: 'Resolved', value: stats.resolvedComplaints, fill: '#10b981' },
  ];

  const departmentData = useMemo(() => {
    const depts: Record<string, number> = {};
    students.forEach((s) => {
      depts[s.class] = (depts[s.class] || 0) + 1;
    });
    return Object.entries(depts).map(([dept, count]) => ({
      department: dept,
      students: count,
    }));
  }, [students]);

  const handleDownloadFullReport = () => {
    const reportData = {
      'Summary Statistics': {
        'Total Students': stats.totalStudents,
        'Allocated Students': stats.allocatedStudents,
        'Paid Students': stats.paidStudents,
        'Unpaid Students': stats.unpaidStudents,
        'Total Revenue': formatCurrency(stats.totalCollected),
        'Expected Revenue': formatCurrency(stats.totalExpected),
        'Pending Amount': formatCurrency(stats.pendingAmount),
        'Total Rooms': stats.totalRooms,
        'Occupied Rooms': stats.occupiedRooms,
        'Empty Rooms': stats.emptyRooms,
        'Maintenance Rooms': stats.maintenanceRooms,
        'Pending Maintenance': stats.pendingMaintenance,
        'Resolved Maintenance': stats.resolvedMaintenance,
        'Pending Complaints': stats.pendingComplaints,
        'Resolved Complaints': stats.resolvedComplaints,
      },
    };

    // Export as CSV
    const csvData = Object.entries(reportData['Summary Statistics']).map(([key, value]) => ({
      'Metric': key,
      'Value': value,
    }));

    exportToCSV(csvData, 'hostel_report');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of hostel operations</p>
        </div>
        <button
          onClick={handleDownloadFullReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Allocated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.allocatedStudents}</p>
            </div>
            <Building2 className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRooms}</p>
            </div>
            <Building2 className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue Collected</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Amount</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Room Status Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roomStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Status Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Requests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {maintenanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        {departmentData.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Statistics */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Students</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Allocated to Rooms</span>
              <span className="text-2xl font-bold text-green-600">{stats.allocatedStudents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Payment Received</span>
              <span className="text-2xl font-bold text-green-600">{stats.paidStudents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-gray-700">Payment Pending</span>
              <span className="text-2xl font-bold text-red-600">{stats.unpaidStudents}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Total Collected</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Expected</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalExpected)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Pending Amount</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Collection Rate</span>
              <span className="text-xl font-bold text-gray-900">
                {stats.totalExpected > 0 ? `${((stats.totalCollected / stats.totalExpected) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Rooms</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalRooms}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Occupied</span>
              <span className="text-2xl font-bold text-purple-600">{stats.occupiedRooms}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Empty</span>
              <span className="text-2xl font-bold text-gray-600">{stats.emptyRooms}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Under Maintenance</span>
              <span className="text-2xl font-bold text-orange-600">{stats.maintenanceRooms}</span>
            </div>
          </div>
        </div>

        {/* Issues & Complaints */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues & Complaints</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Pending Maintenance</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingMaintenance}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">In Progress</span>
              <span className="text-2xl font-bold text-blue-600">{stats.inProgressMaintenance}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Resolved Maintenance</span>
              <span className="text-2xl font-bold text-green-600">{stats.resolvedMaintenance}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Pending Complaints</span>
              <span className="text-2xl font-bold text-orange-600">{stats.pendingComplaints}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
