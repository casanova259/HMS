import { useState, useEffect } from "react";
import { Plus, Trash2, Archive, Eye } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { SearchBar } from "@/components/common/SearchBar";
import { localStorageService } from "@/services/localStorage";
import { formatDate, getTimeAgo } from "@/utils/formatting";
import { Announcement } from "@/types";

const ANNOUNCEMENT_TYPES = [
  "General",
  "Urgent",
  "Event",
  "Maintenance",
  "Notice",
];
const ANNOUNCEMENT_ICONS: Record<string, string> = {
  General: "📢",
  Urgent: "⚠️",
  Event: "🎉",
  Maintenance: "🔧",
  Notice: "📋",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Scheduled" | "Archived" | "All"
  >("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "General" as
      | "General"
      | "Urgent"
      | "Event"
      | "Maintenance"
      | "Notice",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    targetAllStudents: true,
  });

  useEffect(() => {
    setAnnouncements(localStorageService.getAnnouncements());
  }, []);

  const filteredAnnouncements = announcements
    .filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (typeFilter !== "All" && a.type !== typeFilter) return false;
      if (
        searchTerm &&
        !a.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const handleCreateAnnouncement = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in title and content");
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title: formData.title,
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      targetAudience: {
        allStudents: formData.targetAllStudents,
      },
      visibility: {
        startDate: new Date().toISOString(),
        displayUntilRemoved: true,
      },
      attachments: [],
      notifications: {
        email: true,
        sms: false,
        push: true,
        noticeBoard: true,
      },
      status: "Active",
      views: 0,
      postedBy: "Warden",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageService.addAnnouncement(newAnnouncement);
    setAnnouncements(localStorageService.getAnnouncements());
    setShowCreateModal(false);
    setFormData({
      title: "",
      content: "",
      type: "General",
      priority: "Medium",
      targetAllStudents: true,
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      const updated = announcements.filter((a) => a.id !== id);
      localStorageService.setAnnouncements(updated);
      setAnnouncements(updated);
    }
  };

  const handleArchiveAnnouncement = (id: string) => {
    const announcement = announcements.find((a) => a.id === id);
    if (announcement) {
      localStorageService.updateAnnouncement(id, { status: "Archived" });
      setAnnouncements(localStorageService.getAnnouncements());
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">
            Create and manage announcements for students
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search announcements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {ANNOUNCEMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setTypeFilter("All");
            setStatusFilter("All");
            setSearchTerm("");
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {ANNOUNCEMENT_ICONS[announcement.type] || "📢"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {announcement.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      label={announcement.type}
                      color="bg-blue-100 text-blue-800"
                    />
                    <Badge
                      label={announcement.priority}
                      status={
                        announcement.priority === "Critical"
                          ? "urgent"
                          : announcement.priority === "High"
                            ? "high"
                            : announcement.priority === "Medium"
                              ? "medium"
                              : "low"
                      }
                    />
                    <Badge
                      label={announcement.status}
                      status={
                        announcement.status === "Active"
                          ? "completed"
                          : announcement.status === "Scheduled"
                            ? "in-progress"
                            : "pending"
                      }
                    />
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {announcement.content}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-600">
                  <span>Posted {getTimeAgo(announcement.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {announcement.views} views
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowViewModal(true);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    View
                  </button>
                  {announcement.status !== "Archived" && (
                    <button
                      onClick={() => handleArchiveAnnouncement(announcement.id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Archive className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-2 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No announcements found</p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            title: "",
            content: "",
            type: "General",
            priority: "Medium",
            targetAllStudents: true,
          });
        }}
        title="Create New Announcement"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Announcement title"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your announcement here..."
              maxLength={1000}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/1000
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.targetAllStudents}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetAllStudents: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Send to all students
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  title: "",
                  content: "",
                  type: "General",
                  priority: "Medium",
                  targetAllStudents: true,
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAnnouncement}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Publish Now
            </button>
          </div>
        </div>
      </Modal>

      {/* View Announcement Modal */}
      {selectedAnnouncement && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedAnnouncement(null);
          }}
          title="View Announcement"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">
                {ANNOUNCEMENT_ICONS[selectedAnnouncement.type] || "📢"}
              </span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Posted {getTimeAgo(selectedAnnouncement.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                label={selectedAnnouncement.type}
                color="bg-blue-100 text-blue-800"
              />
              <Badge
                label={selectedAnnouncement.priority}
                status={
                  selectedAnnouncement.priority === "Critical"
                    ? "urgent"
                    : selectedAnnouncement.priority === "High"
                      ? "high"
                      : selectedAnnouncement.priority === "Medium"
                        ? "medium"
                        : "low"
                }
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </p>
            </div>

            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Posted by:</span>{" "}
                {selectedAnnouncement.postedBy}
              </p>
              <p>
                <span className="font-medium">Views:</span>{" "}
                {selectedAnnouncement.views}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedAnnouncement.status}
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
