import { useState, useEffect, useMemo } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";
import { localStorageService } from "@/services/localStorage";
import { getDaysUntil } from "@/utils/formatting";
import { FoodRequest } from "@/types";

export default function FoodRequests() {
  const [foodRequests, setFoodRequests] = useState<FoodRequest[]>([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const [newRequest, setNewRequest] = useState({
    dishName: "",
    description: "",
    mealType: "Lunch" as "Breakfast" | "Lunch" | "Snacks" | "Dinner",
    dietary: "Veg" as "Veg" | "Non-veg" | "Both",
    whyWantThis: "",
  });

  useEffect(() => {
    setFoodRequests(localStorageService.getFoodRequests());
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const activeRequests = useMemo(() => {
    return foodRequests
      .filter((r) => r.status === "Active")
      .sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );
  }, [foodRequests]);

  const acceptedRequests = useMemo(() => {
    return foodRequests
      .filter((r) => r.status === "Accepted")
      .sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );
  }, [foodRequests]);

  const rejectedRequests = useMemo(() => {
    return foodRequests
      .filter((r) => r.status === "Rejected")
      .sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );
  }, [foodRequests]);

  const handleAccept = (requestId: string) => {
    localStorageService.updateFoodRequest(requestId, {
      status: "Accepted",
    });
    setFoodRequests(localStorageService.getFoodRequests());
  };

  const handleReject = (requestId: string) => {
    localStorageService.updateFoodRequest(requestId, {
      status: "Rejected",
    });
    setFoodRequests(localStorageService.getFoodRequests());
  };

  const handleAddRequest = () => {
    if (!newRequest.dishName.trim() || !newRequest.whyWantThis.trim()) return;

    const foodRequest: FoodRequest = {
      id: `request_${Date.now()}`,
      dishName: newRequest.dishName,
      description: newRequest.description,
      mealType: newRequest.mealType,
      dietary: newRequest.dietary,
      whyWantThis: newRequest.whyWantThis,
      votes: 0,
      votedBy: [],
      status: "Active",
      createdDate: new Date().toISOString(),
      closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageService.addFoodRequest(foodRequest);
    setFoodRequests(localStorageService.getFoodRequests());
    setShowNewRequestModal(false);
    setNewRequest({
      dishName: "",
      description: "",
      mealType: "Lunch",
      dietary: "Veg",
      whyWantThis: "",
    });
  };

  const getDietaryColor = (dietary: string) => {
    return dietary === "Veg"
      ? "bg-green-100 text-green-800"
      : dietary === "Non-veg"
        ? "bg-orange-100 text-orange-800"
        : "bg-blue-100 text-blue-800";
  };

  const getMealColor = (mealType: string) => {
    const colors: Record<string, string> = {
      Breakfast: "bg-yellow-100 text-yellow-800",
      Lunch: "bg-blue-100 text-blue-800",
      Snacks: "bg-pink-100 text-pink-800",
      Dinner: "bg-purple-100 text-purple-800",
    };
    return colors[mealType] || "bg-gray-100 text-gray-800";
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dish Request Management
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage dish requests submitted by students.
          </p>
        </div>
        {currentUser?.role !== "Warden" && (
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Request Dish
          </button>
        )}
      </div>

      {/* Active Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vote for Your Favorite Dish
        </h2>
        <p className="text-gray-600 mb-4">
          Voting closes in{" "}
          {Math.max(
            0,
            getDaysUntil(activeRequests[0]?.closingDate || new Date()),
          )}{" "}
          days
        </p>
        {currentUser?.role === "Warden" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> As a Warden, you can
              review and vote on dishes but cannot submit new requests. Students
              can submit dish requests.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRequests.length > 0 ? (
            activeRequests.map((request) => {
              const votePercentage = getVotePercentage(
                request.votes,
                totalVotes || 1,
              );
              const userVoted = hasVoted(request);

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      🍽️ {request.dishName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        label={request.mealType}
                        color={getMealColor(request.mealType)}
                      />
                      <Badge
                        label={request.dietary}
                        color={getDietaryColor(request.dietary)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {request.description && (
                    <p className="text-gray-700 text-sm mb-4">
                      {request.description}
                    </p>
                  )}

                  {/* Votes */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {request.votes} {request.votes === 1 ? "vote" : "votes"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {votePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${votePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Why wanted */}
                  <p className="text-xs text-gray-600 mb-4 italic">
                    "{request.whyWantThis}"
                  </p>

                  {/* Vote Button */}
                  <button
                    onClick={() => handleVote(request.id)}
                    disabled={userVoted}
                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      userVoted
                        ? "bg-green-100 text-green-800 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {userVoted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        You Voted ✓
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4" />
                        Vote
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-600">
              <p>No active dish requests at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Requested Sidebar */}
      {topRequests.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Top Requested Dishes
          </h3>
          <div className="space-y-4">
            {topRequests.map((request, index) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-blue-600">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {request.dishName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.votes} votes
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Consider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Past Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg p-6 shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    🍽️ {request.dishName}
                  </h3>
                  <Badge
                    label={request.implementationStatus || "Pending"}
                    status={
                      request.implementationStatus === "Added to menu"
                        ? "completed"
                        : request.implementationStatus === "Rejected"
                          ? "pending"
                          : "in-progress"
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {request.votes} total votes received
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    label={request.mealType}
                    color={getMealColor(request.mealType)}
                  />
                  <Badge
                    label={request.dietary}
                    color={getDietaryColor(request.dietary)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => {
          setShowNewRequestModal(false);
          setNewRequest({
            dishName: "",
            description: "",
            mealType: "Lunch",
            dietary: "Veg",
            whyWantThis: "",
          });
        }}
        title="Request a Dish"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name *
            </label>
            <input
              type="text"
              value={newRequest.dishName}
              onChange={(e) =>
                setNewRequest((prev) => ({
                  ...prev,
                  dishName: e.target.value,
                }))
              }
              placeholder="Enter dish name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newRequest.description}
              onChange={(e) =>
                setNewRequest((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the dish..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type *
              </label>
              <select
                value={newRequest.mealType}
                onChange={(e) =>
                  setNewRequest((prev) => ({
                    ...prev,
                    mealType: e.target.value as
                      | "Breakfast"
                      | "Lunch"
                      | "Snacks"
                      | "Dinner",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={newRequest.dietary}
                onChange={(e) =>
                  setNewRequest((prev) => ({
                    ...prev,
                    dietary: e.target.value as "Veg" | "Non-veg" | "Both",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-veg">Non-Vegetarian</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why You Want This *
            </label>
            <textarea
              value={newRequest.whyWantThis}
              onChange={(e) =>
                setNewRequest((prev) => ({
                  ...prev,
                  whyWantThis: e.target.value,
                }))
              }
              placeholder="Explain why you want this dish..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowNewRequestModal(false);
                setNewRequest({
                  dishName: "",
                  description: "",
                  mealType: "Lunch",
                  dietary: "Veg",
                  whyWantThis: "",
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRequest}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
