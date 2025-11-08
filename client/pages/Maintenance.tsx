import { useState, useEffect, useMemo } from "react";
import { AlertCircle, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { SearchBar } from "@/components/common/SearchBar";
import { localStorageService } from "@/services/localStorage";
import { formatDate, getTimeAgo } from "@/utils/formatting";
import { MaintenanceRequest, Room } from "@/types";

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "In Progress" | "Resolved"
  >("All");
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [technicianName, setTechnicianName] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  // Filters
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [roomSearch, setRoomSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  useEffect(() => {
    setMaintenance(localStorageService.getMaintenanceRequests());
    setRooms(localStorageService.getRooms());
  }, []);

  // Filter maintenance requests
  const filteredMaintenance = useMemo(() => {
    let filtered = [...maintenance];

    // Filter by tab
    if (activeTab !== "All") {
      filtered = filtered.filter((m) => m.status === activeTab);
    }

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(
        (m) => new Date(m.reportedDate) >= new Date(fromDate),
      );
    }
    if (toDate) {
      filtered = filtered.filter(
        (m) => new Date(m.reportedDate) <= new Date(toDate),
      );
    }

    // Filter by room
    if (roomSearch) {
      const room = rooms.find((r) => r.number.includes(roomSearch));
      if (room) {
        filtered = filtered.filter((m) => m.roomId === room.id);
      }
    }

    // Filter by category
    if (categoryFilter !== "All") {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    // Filter by priority
    if (priorityFilter !== "All") {
      filtered = filtered.filter((m) => m.priority === priorityFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime(),
    );
  }, [
    maintenance,
    activeTab,
    fromDate,
    toDate,
    roomSearch,
    categoryFilter,
    priorityFilter,
    rooms,
  ]);

  const getRoomNumber = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.number || "Unknown";
  };

  const handleAssignTechnician = () => {
    if (selectedRequest && technicianName.trim()) {
      localStorageService.updateMaintenanceRequest(selectedRequest.id, {
        assignedTechnician: technicianName,
        status: "In Progress",
        progressPercentage: 0,
      });
      setMaintenance(localStorageService.getMaintenanceRequests());
      setShowTechnicianModal(false);
      setTechnicianName("");
      setSelectedRequest(null);
    }
  };

  const handleUpdateProgress = (requestId: string, newProgress: number) => {
    localStorageService.updateMaintenanceRequest(requestId, {
      progressPercentage: newProgress,
    });
    setMaintenance(localStorageService.getMaintenanceRequests());
    setShowProgressModal(false);
  };

  const handleResolve = (requestId: string) => {
    localStorageService.updateMaintenanceRequest(requestId, {
      status: "Resolved",
      progressPercentage: 100,
      resolvedDate: new Date().toISOString(),
    });
    setMaintenance(localStorageService.getMaintenanceRequests());
    setIsModalOpen(false);
  };

  const tabs: Array<"All" | "Pending" | "In Progress" | "Resolved"> = [
    "All",
    "Pending",
    "In Progress",
    "Resolved",
  ];

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "Pending":
        return maintenance.filter((m) => m.status === "Pending").length;
      case "In Progress":
        return maintenance.filter((m) => m.status === "In Progress").length;
      case "Resolved":
        return maintenance.filter((m) => m.status === "Resolved").length;
      default:
        return maintenance.length;
    }
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Maintenance Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Track and manage maintenance issues
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getTabColor(tab)}`}
              >
                {getTabCount(tab)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room
            </label>
            <SearchBar
              value={roomSearch}
              onChange={setRoomSearch}
              placeholder="Room number..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>Furniture</option>
              <option>Cleaning</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setRoomSearch("");
                setCategoryFilter("All");
                setPriorityFilter("All");
              }}
              className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredMaintenance.length} requests
        </p>
      </div>

      {/* Maintenance Cards */}
      <div className="space-y-4">
        {filteredMaintenance.length > 0 ? (
          filteredMaintenance.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {request.title}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      label={request.category}
                      color="bg-blue-100 text-blue-800"
                    />
                    <Badge
                      label={request.priority}
                      status={
                        request.priority === "High"
                          ? "high"
                          : request.priority === "Medium"
                            ? "medium"
                            : "low"
                      }
                    />
                    <Badge
                      label={request.status}
                      status={
                        request.status === "Pending"
                          ? "pending"
                          : request.status === "In Progress"
                            ? "in-progress"
                            : "completed"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Room</p>
                  <p className="font-semibold text-gray-900">
                    {getRoomNumber(request.roomId)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Reported By</p>
                  <p className="font-semibold text-gray-900">
                    {request.reportedBy}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Reported Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(request.reportedDate)}
                  </p>
                </div>
                {request.status !== "Pending" && (
                  <div>
                    <p className="text-gray-600">Technician</p>
                    <p className="font-semibold text-gray-900">
                      {request.assignedTechnician || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4">{request.description}</p>

              {/* Status-specific content */}
              {request.status === "In Progress" && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {request.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${request.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {request.status === "Resolved" && request.resolutionNotes && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="inline w-4 h-4 mr-2" />
                    {request.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {request.status === "Pending" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setTechnicianName("");
                        setShowTechnicianModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Assign Technician
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Mark in Progress
                    </button>
                  </>
                )}
                {request.status === "In Progress" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setProgressPercentage(request.progressPercentage);
                        setShowProgressModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Update Progress
                    </button>
                    <button
                      onClick={() => handleResolve(request.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}
                {request.status === "Resolved" && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No maintenance requests found</p>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          title="Update Progress"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Percentage
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-center font-semibold text-gray-900 mt-2">
                {progressPercentage}%
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateProgress(selectedRequest.id, progressPercentage)
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
