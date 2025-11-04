import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  Home,
  Wrench,
  MessageSquare,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { localStorageService } from '@/services/localStorage';
import { calculateOccupancyRate, formatCurrency, formatDate, getTimeAgo, exportToCSV } from '@/utils/formatting';
import { Room, Student, MaintenanceRequest, Complaint, Activity } from '@/types';

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setRooms(localStorageService.getRooms());
    setStudents(localStorageService.getStudents());
    setMaintenance(localStorageService.getMaintenanceRequests());
    setComplaints(localStorageService.getComplaints());
    setActivities(localStorageService.getActivities());
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
    const emptyRooms = rooms.filter((r) => r.status === 'Empty').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

    const totalStudents = students.length;
    const paidStudents = students.filter((s) => s.paymentStatus === 'Paid').length;
    const unpaidStudents = students.filter((s) => s.paymentStatus === 'Unpaid').length;

    const pendingMaintenance = maintenance.filter((m) => m.status === 'Pending').length;
    const unresolvedComplaints = complaints.filter((c) => c.status === 'Pending').length;

    const occupancyRate = calculateOccupancyRate(rooms);

    return {
      totalRooms,
      occupiedRooms,
      emptyRooms,
      maintenanceRooms,
      totalStudents,
      paidStudents,
      unpaidStudents,
      pendingMaintenance,
      unresolvedComplaints,
      occupancyRate,
    };
  }, [rooms, students, maintenance, complaints]);

  // Data for payment chart
  const paymentData = [
    { name: 'Paid', value: stats.paidStudents, fill: '#10b981' },
    { name: 'Unpaid', value: stats.unpaidStudents, fill: '#ef4444' },
  ];

  // Data for room status chart
  const roomStatusData = [
    { name: 'Occupied', value: stats.occupiedRooms, fill: '#a855f7' },
    { name: 'Empty', value: stats.emptyRooms, fill: '#9ca3af' },
    { name: 'Maintenance', value: stats.maintenanceRooms, fill: '#f97316' },
  ];

  // Recent activities (last 5-10)
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Handle payment report download
  const handleDownloadPaymentReport = () => {
    const paymentData = students.map((student) => ({
      'Roll Number': student.rollNumber,
      'Name': student.fullName,
      'Payment Status': student.paymentStatus,
      'Amount': student.paymentDetails?.paidAmount || 0,
      'Transaction ID': student.paymentDetails?.transactionId || 'N/A',
      'Date': student.paymentDetails?.paidDate || 'N/A',
    }));
    exportToCSV(paymentData, 'payment_report');
  };

  // Recent payments
  const recentPayments = students
    .filter((s) => s.paymentStatus === 'Paid' && s.paymentDetails?.paidDate)
    .sort((a, b) => new Date(b.paymentDetails?.paidDate || 0).getTime() - new Date(a.paymentDetails?.paidDate || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Occupancy"
            value={`${stats.occupancyRate}%`}
            icon={Home}
            color="blue"
            subtitle={`${stats.occupiedRooms}/${stats.totalRooms} rooms`}
          />
          <StatCard
            title="Students Paid"
            value={stats.paidStudents}
            icon={Users}
            color="green"
            subtitle={`${((stats.paidStudents / stats.totalStudents) * 100).toFixed(0)}% of total`}
          />
          <StatCard
            title="Pending Maintenance"
            value={stats.pendingMaintenance}
            icon={Wrench}
            color="orange"
            subtitle={`${maintenance.length} total requests`}
          />
          <StatCard
            title="Unresolved Complaints"
            value={stats.unresolvedComplaints}
            icon={MessageSquare}
            color="red"
            subtitle={`${complaints.length} total complaints`}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
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

        {/* Payment Status Chart */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Overview and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPaymentReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
              <Link
                to="/payments"
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                View All
              </Link>
            </div>
          </div>

          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Transaction ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-gray-900">{payment.fullName}</p>
                          <p className="text-xs text-gray-500">{payment.rollNumber}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold text-green-600">
                        {formatCurrency(payment.paymentDetails?.paidAmount || 0)}
                      </td>
                      <td className="py-3 px-2 text-gray-700 text-xs">
                        {payment.paymentDetails?.transactionId || 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {payment.paymentDetails?.paidDate ? formatDate(payment.paymentDetails.paidDate) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent payments</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/students?tab=add"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Allocate Room
            </Link>
            <Link
              to="/announcements?tab=create"
              className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
            >
              Create Announcement
            </Link>
            <Link
              to="/maintenance?tab=pending"
              className="block w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center font-medium"
            >
              View Maintenance
            </Link>
            <Link
              to="/menu"
              className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
            >
              Manage Menu
            </Link>
            <Link
              to="/reports"
              className="block w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Generate Report
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === 'Student Allocated' && <Users className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'Payment Received' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {activity.type === 'Maintenance Reported' && <Wrench className="w-5 h-5 text-orange-600" />}
                    {activity.type === 'Complaint Filed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    {activity.type === 'Announcement Posted' && <Eye className="w-5 h-5 text-purple-600" />}
                  </div>
                  {index !== recentActivities.length - 1 && (
                    <div className="w-1 h-12 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
