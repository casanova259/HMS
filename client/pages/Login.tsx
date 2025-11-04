import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardList } from "lucide-react";

type UserRole = "Warden" | "Librarian" | "HOD";

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Warden");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    staffId: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Store user info in localStorage
    const userInfo = {
      role: selectedRole,
      name: formData.name,
      email: formData.email,
      staffId: formData.staffId,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("currentUser", JSON.stringify(userInfo));

    // Redirect to dashboard
    navigate("/");
  };

  const handleFaceRecognition = () => {
    alert("Face Recognition login coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">College Name</h1>
          <p className="text-gray-600 text-sm mt-2">
            Select your role to begin
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setSelectedRole("Warden")}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedRole === "Warden"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-900">Warden</p>
          </button>

          <button
            onClick={() => setSelectedRole("Librarian")}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedRole === "Librarian"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-900">Librarian</p>
          </button>

          <button
            onClick={() => setSelectedRole("HOD")}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedRole === "HOD"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <ClipboardList className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-900">HOD</p>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ID
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff ID
            </label>
            <input
              type="text"
              value={formData.staffId}
              onChange={(e) => handleInputChange("staffId", e.target.value)}
              placeholder="Enter your staff ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Face Recognition */}
        <button
          onClick={handleFaceRecognition}
          className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Login with Face Recognition
        </button>
      </div>
    </div>
  );
}
