import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [wardenId, setWardenId] = useState("WARDERN001");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Store user info in localStorage
    const userInfo = {
      role: "Warden",
      wardenId: wardenId,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("currentUser", JSON.stringify(userInfo));

    // Redirect to dashboard
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Warden Login</h1>
          <p className="text-gray-600 text-sm mt-2">
            Enter your credentials to access the system
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warden ID
            </label>
            <input
              type="text"
              value={wardenId}
              onChange={(e) => setWardenId(e.target.value)}
              placeholder="Enter Warden ID"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            onClick={handleLogin}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
