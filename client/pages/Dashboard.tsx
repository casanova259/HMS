import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatCard from "./../components/common/StatCard";
import {
  Users,
  BedDouble,
  CurrencyIcon,
  Receipt,
  Wrench,
  MessageSquareWarning,
  ArrowRight,
  Annoyed,
  Smile,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom"; // Import Link

// Sample data (as was in the original file)
const recentActivities = [
  { id: 1, student: "Alice Smith", room: "A-102", action: "Checked In", time: "2m ago" },
  { id: 2, student: "Bob Johnson", room: "B-305", action: "Paid Fees", time: "1h ago" },
  { id: 3, student: "Carol White", room: "C-110", action: "Filed Complaint", time: "3h ago" },
];

const menu = {
  breakfast: "Poha, Jalebi, Tea/Coffee",
  lunch: "Rajma, Rice, Roti, Salad",
  dinner: "Paneer Butter Masala, Roti, Rice",
};

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Stat Cards - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/rooms">
          <StatCard
            title="Total Occupancy"
            value="450/500"
            icon={BedDouble}
            trend="up"
          />
        </Link>
        <Link to="/students">
          <StatCard
            title="Total Students"
            value="480"
            icon={Users}
            trend="up"
          />
        </Link>
        <Link to="/payments">
          <StatCard
            title="Fees Paid"
            value="₹1,20,000"
            icon={CurrencyIcon}
            trend="up"
          />
        </Link>
        <Link to="/payments">
          <StatCard
            title="Pending Dues"
            value="₹15,000"
            icon={Receipt}
            trend="down"
          />
        </Link>
      </div>

      {/* Quick Access & Menu - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/maintenance">
          <StatCard
            title="Pending Maintenance"
            value="5 Requests"
            icon={Wrench}
            trend="up"
          />
        </Link>
        <Link to="/complaints">
          <StatCard
            title="Unresolved Complaints"
            value="3"
            icon={MessageSquareWarning}
            trend="up"
          />
        </Link>

        {/* Today's Menu Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Today's Menu
            </CardTitle>
            <Link
              to="/menu"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All <ArrowRight className="h-4 w-4 inline" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Breakfast:</span>
                <p className="text-sm text-muted-foreground">{menu.breakfast}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Lunch:</span>
                <p className="text-sm text-muted-foreground">{menu.lunch}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Dinner:</span>
                <p className="text-sm text-muted-foreground">{menu.dinner}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Feedback Summary - Row 3 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.student}</TableCell>
                    <TableCell>
                      <Badge variant={activity.action === "Paid Fees" ? "secondary" : "default"}>
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.room}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Hostel Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smile className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Positive Feedback</span>
              </div>
              <span className="font-bold text-lg text-green-700">18</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Annoyed className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Negative Feedback</span>
              </div>
              <span className="font-bold text-lg text-red-700">4</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Open Alerts</span>
              </div>
              <span className="font-bold text-lg text-yellow-700">1</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Food Requests</span>
              </div>
              <span className="font-bold text-lg text-blue-700">7</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
