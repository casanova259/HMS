import { useState, useMemo } from "react";
import { Plus, Check, AlertCircle, Download } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { localStorageService } from "@/services/localStorage";
import {
  validateEmail,
  validateMobileNumber,
  validateRollNo,
  formatCurrency,
  getCapacityNumber,
} from "@/utils/formatting";
import { Student, Room } from "@/types";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DEPARTMENTS: Array<"CSE" | "ECE" | "ME" | "CE"> = [
  "CSE",
  "ECE",
  "ME",
  "CE",
];

interface FormErrors {
  [key: string]: string;
}

interface SuccessData {
  studentId: string;
  studentName: string;
  roomNumber: string;
  bedNumber: number;
}

export default function Students() {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [semesterFilter, setSemesterFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    universityRollNumber: "",
    class: "CSE" as "CSE" | "ECE" | "ME" | "CE",
    semester: "1",
    session: "2024-25",
    fathersName: "",
    mobileNumber: "",
    emergencyContact: "",
    email: "",
    dob: "",
    bloodGroup: "",
    address: "",
    previousHostel: "",
    medicalConditions: "",
    allergyInformation: "",
    selectedRoomId: "",
    selectedBedNumber: "",
    paymentStatus: "Unpaid" as "Paid" | "Unpaid",
    transactionId: "",
  });

  const rooms = localStorageService.getRooms();
  const students = localStorageService.getStudents();

  // Filter students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (departmentFilter !== "All") {
      filtered = filtered.filter((s) => s.class === departmentFilter);
    }

    if (semesterFilter !== "All") {
      filtered = filtered.filter((s) => s.semester === parseInt(semesterFilter));
    }

    if (sessionFilter !== "All") {
      filtered = filtered.filter((s) => s.session === sessionFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query),
      );
    }

    return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, departmentFilter, semesterFilter, sessionFilter, searchQuery]);

  // Get available rooms (with empty beds)
  const availableRooms = useMemo(() => {
    return rooms.filter((room) => {
      const capacity = getCapacityNumber(room.capacity);
      return room.status !== "Maintenance" && room.occupancy < capacity;
    });
  }, [rooms]);

  // Get available beds in selected room
  const selectedRoom = formData.selectedRoomId
    ? rooms.find((r) => r.id === formData.selectedRoomId)
    : null;
  const availableBeds = useMemo(() => {
    if (!selectedRoom) return [];
    const capacity = getCapacityNumber(selectedRoom.capacity);
    const beds: number[] = [];
    for (let i = 1; i <= capacity; i++) {
      beds.push(i);
    }
    return beds;
  }, [selectedRoom]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.rollNumber.trim())
      errors.rollNumber = "Roll number is required";
    if (!validateRollNo(formData.universityRollNumber)) {
      errors.universityRollNumber = "Invalid university roll number format";
    }
    if (!validateMobileNumber(formData.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }
    if (!validateMobileNumber(formData.emergencyContact)) {
      errors.emergencyContact = "Emergency contact must be 10 digits";
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Invalid email address";
    }
    if (!formData.selectedRoomId)
      errors.selectedRoomId = "Room selection is required";
    if (!formData.selectedBedNumber)
      errors.selectedBedNumber = "Bed selection is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export");
      return;
    }

    // Prepare CSV header
    const headers = [
      "Student ID",
      "Full Name",
      "Roll Number",
      "University Roll Number",
      "Department",
      "Semester",
      "Session",
      "Email",
      "Mobile Number",
      "Emergency Contact",
      "Father's Name",
      "Date of Birth",
      "Blood Group",
      "Address",
      "Previous Hostel",
      "Medical Conditions",
      "Allergy Information",
      "Room Number",
      "Bed Number",
      "Payment Status",
      "Paid Amount",
      "Paid Date",
      "Transaction ID",
    ];

    // Prepare CSV rows
    const rows = filteredStudents.map((student) => {
      const room = rooms.find((r) => r.id === student.roomId);
      return [
        student.id,
        student.fullName,
        student.rollNumber,
        student.universityRollNumber,
        student.class,
        student.semester,
        student.session,
        student.email,
        student.mobileNumber,
        student.emergencyContact,
        student.fathersName || "",
        student.dob ? student.dob.split("T")[0] : "",
        student.bloodGroup || "",
        student.address || "",
        student.previousHostel || "",
        student.medicalConditions || "",
        student.allergyInformation || "",
        room ? room.number : "N/A",
        student.bedNumber,
        student.paymentStatus,
        student.paymentDetails?.paidAmount || 0,
        student.paymentDetails?.paidDate
          ? student.paymentDetails.paidDate.split("T")[0]
          : "",
        student.paymentDetails?.transactionId || "",
      ];
    });

    // Convert to CSV string
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell,
          )
          .join(","),
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAllocateStudent = () => {
    if (!validateForm()) return;

    const newStudent: Student = {
      id: `student_${Date.now()}`,
      fullName: formData.fullName,
      rollNumber: formData.rollNumber,
      universityRollNumber: formData.universityRollNumber,
      class: formData.class,
      semester: parseInt(formData.semester),
      session: formData.session,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      emergencyContact: formData.emergencyContact,
      fathersName: formData.fathersName || undefined,
      dob: formData.dob || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      address: formData.address || undefined,
      previousHostel: formData.previousHostel || undefined,
      medicalConditions: formData.medicalConditions || undefined,
      allergyInformation: formData.allergyInformation || undefined,
      roomId: formData.selectedRoomId,
      bedNumber: parseInt(formData.selectedBedNumber),
      paymentStatus: formData.paymentStatus,
      paymentDetails: {
        transactionId: formData.transactionId || undefined,
        paidAmount: formData.paymentStatus === "Paid" ? 30000 : 0,
        paidDate:
          formData.paymentStatus === "Paid"
            ? new Date().toISOString()
            : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save student
    localStorageService.addStudent(newStudent);

    // Update room occupancy
    const room = rooms.find((r) => r.id === formData.selectedRoomId);
    if (room) {
      localStorageService.updateRoom(room.id, {
        occupancy: room.occupancy + 1,
      });
    }

    // Show success modal
    const selectedRoomObj = rooms.find((r) => r.id === formData.selectedRoomId);
    setSuccessData({
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      roomNumber: selectedRoomObj?.number || "Unknown",
      bedNumber: parseInt(formData.selectedBedNumber),
    });
    setShowSuccessModal(true);

    // Reset form
    setFormData({
      fullName: "",
      rollNumber: "",
      universityRollNumber: "",
      class: "CSE",
      semester: "1",
      session: "2024-25",
      fathersName: "",
      mobileNumber: "",
      emergencyContact: "",
      email: "",
      dob: "",
      bloodGroup: "",
      address: "",
      previousHostel: "",
      medicalConditions: "",
      allergyInformation: "",
      selectedRoomId: "",
      selectedBedNumber: "",
      paymentStatus: "Unpaid",
      transactionId: "",
    });
  };

  if (activeTab === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-2">Manage hostel students ({filteredStudents.length})</p>
          </div>
          <button
            onClick={() => setActiveTab("add")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, roll no, email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>ME</option>
                <option>CE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester/Batch
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session (Year)
              </label>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>2024-25</option>
                <option>2023-24</option>
                <option>2022-23</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDepartmentFilter("All");
                  setSemesterFilter("All");
                  setSessionFilter("All");
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => {
                    const room = rooms.find((r) => r.id === student.roomId);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-900">{student.fullName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">{student.rollNumber}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge label={student.class} color="bg-blue-100 text-blue-800" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">Sem {student.semester}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">{student.session}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {room ? `${room.number} (Bed ${student.bedNumber})` : "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            label={student.paymentStatus}
                            status={student.paymentStatus === "Paid" ? "paid" : "unpaid"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No students found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setActiveTab("list")}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        ← Back to List
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-gray-600 mt-2">
          Allocate a new student to the hostel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.fullName && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    handleInputChange("rollNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.rollNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="CSE001"
                />
                {formErrors.rollNumber && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.rollNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    handleInputChange("semester", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session *
                </label>
                <select
                  value={formData.session}
                  onChange={(e) => handleInputChange("session", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>2024-25</option>
                  <option>2023-24</option>
                  <option>2022-23</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Roll Number *
                </label>
                <input
                  type="text"
                  value={formData.universityRollNumber}
                  onChange={(e) =>
                    handleInputChange("universityRollNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.universityRollNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="PEC2024CSE001"
                />
                {formErrors.universityRollNumber && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.universityRollNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={formData.fathersName}
                  onChange={(e) =>
                    handleInputChange("fathersName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Father's Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    handleInputChange("bloodGroup", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    handleInputChange("mobileNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.mobileNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                />
                {formErrors.mobileNumber && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.emergencyContact
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                />
                {formErrors.emergencyContact && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.emergencyContact}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="student@college.edu"
                />
                {formErrors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Hostel
                </label>
                <input
                  type="text"
                  value={formData.previousHostel}
                  onChange={(e) =>
                    handleInputChange("previousHostel", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Previous hostel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) =>
                    handleInputChange("medicalConditions", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any medical conditions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergy Information
                </label>
                <textarea
                  value={formData.allergyInformation}
                  onChange={(e) =>
                    handleInputChange("allergyInformation", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any allergies"
                />
              </div>
            </div>
          </div>

          {/* Room Allocation */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Room Allocation *
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Room
              </label>
              <select
                value={formData.selectedRoomId}
                onChange={(e) => {
                  handleInputChange("selectedRoomId", e.target.value);
                  handleInputChange("selectedBedNumber", "");
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.selectedRoomId
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Choose a room...</option>
                {availableRooms.map((room) => {
                  const capacity = getCapacityNumber(room.capacity);
                  return (
                    <option key={room.id} value={room.id}>
                      {room.number} - {room.floor} Floor, Block {room.block} (
                      {capacity - room.occupancy} bed available)
                    </option>
                  );
                })}
              </select>
              {formErrors.selectedRoomId && (
                <p className="text-red-600 text-xs mt-1">
                  {formErrors.selectedRoomId}
                </p>
              )}
            </div>

            {selectedRoom && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select Bed Number
                </p>
                <div className="space-y-2">
                  {availableBeds.map((bed) => (
                    <label key={bed} className="flex items-center">
                      <input
                        type="radio"
                        name="bed"
                        value={bed}
                        checked={formData.selectedBedNumber === String(bed)}
                        onChange={(e) =>
                          handleInputChange("selectedBedNumber", e.target.value)
                        }
                        className="mr-3"
                      />
                      <span className="text-gray-700">Bed {bed}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Hostel Fee:</span>{" "}
                {formatCurrency(25000)}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Security Deposit:</span>{" "}
                {formatCurrency(5000)}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                Total Amount: {formatCurrency(30000)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) =>
                  handleInputChange("paymentStatus", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {formData.paymentStatus === "Paid" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) =>
                    handleInputChange("transactionId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TXN123456"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAllocateStudent}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Allocate Student
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Allocation Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Student Name</p>
                <p className="font-semibold text-gray-900">
                  {formData.fullName || "Not entered"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Roll Number</p>
                <p className="font-semibold text-gray-900">
                  {formData.rollNumber || "Not entered"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Selected Room</p>
                <p className="font-semibold text-gray-900">
                  {selectedRoom ? selectedRoom.number : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Selected Bed</p>
                <p className="font-semibold text-gray-900">
                  {formData.selectedBedNumber
                    ? `Bed ${formData.selectedBedNumber}`
                    : "Not selected"}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-gray-600">Total Fee</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(30000)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <Badge
                  label={formData.paymentStatus}
                  status={formData.paymentStatus === "Paid" ? "paid" : "unpaid"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successData && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setActiveTab("list");
          }}
          title="Student Allocated Successfully!"
          size="md"
        >
          <div className="text-center space-y-4">
            <Check className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2">
                Student has been successfully allocated to:
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {successData.roomNumber}
              </p>
              <p className="text-gray-600 mt-1">Bed {successData.bedNumber}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Student ID:</span>{" "}
                {successData.studentId}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Name:</span>{" "}
                {successData.studentName}
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab("list");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form and keep on add page
                  setFormData({
                    fullName: "",
                    rollNumber: "",
                    universityRollNumber: "",
                    class: "CSE",
                    semester: "1",
                    session: "2024-25",
                    fathersName: "",
                    mobileNumber: "",
                    emergencyContact: "",
                    email: "",
                    dob: "",
                    bloodGroup: "",
                    address: "",
                    previousHostel: "",
                    medicalConditions: "",
                    allergyInformation: "",
                    selectedRoomId: "",
                    selectedBedNumber: "",
                    paymentStatus: "Unpaid",
                    transactionId: "",
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Another Student
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
