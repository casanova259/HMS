import { useState, useEffect, useMemo } from "react";
import { Eye, AlertCircle, Wrench } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { SearchBar } from "@/components/common/SearchBar";
import { localStorageService } from "@/services/localStorage";
import { formatDate, getStudentsByRoom } from "@/utils/formatting";
import { Room, Student } from "@/types";

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [floorFilter, setFloorFilter] = useState<string>("All");
  const [blockFilter, setBlockFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [capacityFilter, setCapacityFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setRooms(localStorageService.getRooms());
    setStudents(localStorageService.getStudents());
  }, []);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (floorFilter !== "All" && room.floor !== floorFilter) return false;
      if (blockFilter !== "All" && room.block !== blockFilter) return false;
      if (statusFilter !== "All" && room.status !== statusFilter) return false;
      if (capacityFilter !== "All" && room.capacity !== capacityFilter)
        return false;
      if (searchTerm && !room.number.includes(searchTerm)) return false;
      return true;
    });
  }, [
    rooms,
    floorFilter,
    blockFilter,
    statusFilter,
    capacityFilter,
    searchTerm,
  ]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const getRoomBorderColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "border-purple-500 bg-purple-50";
      case "Empty":
        return "border-gray-300 bg-gray-50";
      case "Maintenance":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getRoomStudents = (roomId: string) => {
    return getStudentsByRoom(students, roomId);
  };

  const allPaymentsPaid = (roomId: string) => {
    const roomStudents = getRoomStudents(roomId);
    return roomStudents.every((s) => s.paymentStatus === "Paid");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
        <p className="text-gray-600 mt-2">Manage and view all hostel rooms</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Ground</option>
              <option>1st</option>
              <option>2nd</option>
              <option>3rd</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block
            </label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Occupied</option>
              <option>Empty</option>
              <option>Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity
            </label>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Single</option>
              <option>Double</option>
              <option>Triple</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Room
            </label>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Room number..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setFloorFilter("All");
              setBlockFilter("All");
              setStatusFilter("All");
              setCapacityFilter("All");
              setSearchTerm("");
            }}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            Clear Filters
          </button>
          <span className="text-sm text-gray-600 pt-2">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const roomStudents = getRoomStudents(room.id);
            const paymentStatus = allPaymentsPaid(room.id) ? "Paid" : "Pending";

            return (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow ${getRoomBorderColor(
                  room.status,
                )}`}
              >
                {/* Room Number */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {room.number}
                </h3>

                {/* Occupancy Badge */}
                <div className="mb-4">
                  <Badge
                    label={`${room.occupancy}/${room.capacity === "Single" ? 1 : room.capacity === "Double" ? 2 : 3} Occupied`}
                    status={
                      room.status === "Occupied"
                        ? "occupied"
                        : room.status === "Empty"
                          ? "empty"
                          : "maintenance"
                    }
                  />
                </div>

                {/* Status-specific content */}
                {room.status === "Occupied" && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Students:
                    </p>
                    {roomStudents.map((student) => (
                      <p key={student.id} className="text-sm text-gray-600">
                        👤 {student.fullName}
                      </p>
                    ))}
                  </div>
                )}

                {room.status === "Empty" && (
                  <p className="text-sm text-gray-600 mb-4">
                    ✅ Available for allocation
                  </p>
                )}

                {room.status === "Maintenance" && (
                  <div className="mb-4 p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <Wrench className="inline w-4 h-4 mr-2" />
                      {room.maintenanceIssue || "Under maintenance"}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                <div className="mb-4 text-xs text-gray-600 space-y-1">
                  <p>
                    🌀 Fans: {room.amenities.fans}/{room.amenities.fans}
                  </p>
                  <p>
                    💡 Lights: {room.amenities.lights}/{room.amenities.lights}
                  </p>
                  <p>
                    📊 Available: {room.amenities.tables}/
                    {room.amenities.tables}
                  </p>
                </div>

                {/* Payment Status */}
                <div className="mb-4">
                  <Badge
                    label={`${paymentStatus === "Paid" ? "All" : "Payment"} ${paymentStatus}`}
                    status={paymentStatus === "Paid" ? "paid" : "unpaid"}
                  />
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoomClick(room);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No rooms found matching your filters
            </p>
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Room ${selectedRoom.number} Details`}
          size="md"
        >
          <div className="space-y-6">
            {/* Room Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Room Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRoom.number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    label={selectedRoom.status}
                    status={
                      selectedRoom.status === "Occupied"
                        ? "occupied"
                        : selectedRoom.status === "Empty"
                          ? "empty"
                          : "maintenance"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floor</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRoom.floor}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Block</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRoom.block}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRoom.capacity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Occupancy</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRoom.occupancy}/
                    {selectedRoom.capacity === "Single"
                      ? 1
                      : selectedRoom.capacity === "Double"
                        ? 2
                        : 3}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Last Inspection</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedRoom.lastInspection)}
                  </p>
                </div>
              </div>
            </div>

            {/* Students Section */}
            {getRoomStudents(selectedRoom.id).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Allocated Students
                </h3>
                <div className="space-y-4">
                  {getRoomStudents(selectedRoom.id).map((student) => (
                    <div
                      key={student.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.rollNumber}
                          </p>
                        </div>
                        <Badge
                          label={student.paymentStatus}
                          status={
                            student.paymentStatus === "Paid" ? "paid" : "unpaid"
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Department</p>
                          <p className="font-medium text-gray-900">
                            {student.class}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Semester</p>
                          <p className="font-medium text-gray-900">
                            {student.semester}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Bed Number</p>
                          <p className="font-medium text-gray-900">
                            Bed {student.bedNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900">
                            {student.mobileNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Amenities
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Item
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedRoom.amenities).map(
                      ([key, value]) => (
                        <tr key={key} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{value}</td>
                          <td className="py-3 px-4">
                            <Badge
                              label={
                                selectedRoom.amenityStatus[key] || "Working"
                              }
                              status={
                                selectedRoom.amenityStatus[key] === "Working"
                                  ? "completed"
                                  : "pending"
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Change Room
              </button>
              <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                Report Issue
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                View History
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
