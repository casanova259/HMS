import { useState, useEffect } from "react";
import { Edit2, Plus, X, Calendar, UtensilsCrossed } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MEAL_TIMES = {
  Breakfast: "7:30 - 9:00 AM",
  Lunch: "12:30 - 2:00 PM",
  Snacks: "5:00 - 6:00 PM",
  Dinner: "7:30 - 9:00 PM",
};

// Mock data structure
const initialMenu = {
  id: "week-44-2024",
  week: 44,
  year: 2024,
  Monday: {
    Breakfast: [
      { name: "Poha + Jalebi", description: "Milk, Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Rajma Masala", description: "Rice, Roti, Salad, Curd", dietary: "Veg" }
    ],
    Snacks: [
      { name: "Samosa", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Aloo Gobi", description: "Dal, Rice, Roti", dietary: "Veg" }
    ]
  },
  Tuesday: {
    Breakfast: [
      { name: "Aloo Paratha", description: "Curd, Pickle, Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Chicken Curry", description: "Rice, Roti, Salad", dietary: "Non-veg" }
    ],
    Snacks: [
      { name: "Pasta", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Bhindi Masala", description: "Dal, Rice, Roti", dietary: "Veg" }
    ]
  },
  Wednesday: {
    Breakfast: [
      { name: "Idli Sambhar", description: "Chutney, Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Special Thali", description: "Paneer, Dal Makhani, Pulao, Sweet", dietary: "Veg" }
    ],
    Snacks: [
      { name: "Bhel Puri", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Egg Curry", description: "Rice, Roti", dietary: "Non-veg" }
    ]
  },
  Thursday: {
    Breakfast: [
      { name: "Chola Bhature", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Kadhi Pakora", description: "Rice, Roti, Salad", dietary: "Veg" }
    ],
    Snacks: [
      { name: "Bread Pakora", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Mix Veg", description: "Dal, Rice, Roti", dietary: "Veg" }
    ]
  },
  Friday: {
    Breakfast: [
      { name: "Dosa", description: "Sambhar, Chutney, Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Fish Fry", description: "Rice, Roti, Salad", dietary: "Non-veg" }
    ],
    Snacks: [
      { name: "Macaroni", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Paneer Butter Masala", description: "Dal, Rice, Roti", dietary: "Veg" }
    ]
  },
  Saturday: {
    Breakfast: [
      { name: "Sandwich", description: "Milk, Tea, Coffee", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Chole Rice", description: "Roti, Salad, Curd", dietary: "Veg" }
    ],
    Snacks: [
      { name: "Kachori", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Lauki ki Sabzi", description: "Dal, Rice, Roti", dietary: "Veg" }
    ]
  },
  Sunday: {
    Breakfast: [
      { name: "Puri Sabzi", description: "Tea, Coffee, Halwa", dietary: "Veg" }
    ],
    Lunch: [
      { name: "Chicken Biryani", description: "Raita, Salad", dietary: "Non-veg" }
    ],
    Snacks: [
      { name: "Maggi", description: "Tea, Coffee", dietary: "Veg" }
    ],
    Dinner: [
      { name: "Khichdi", description: "Curd, Papad", dietary: "Veg" }
    ]
  }
};

export default function Menu() {
  const [currentMenu, setCurrentMenu] = useState(initialMenu);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState({ day: "", meal: "", isOpen: false });
  const [newDishName, setNewDishName] = useState("");
  const [newDishDescription, setNewDishDescription] = useState("");
  const [newDishDietary, setNewDishDietary] = useState("Veg");

  const handleEditCell = (day, meal) => {
    if (!isEditMode) return;
    setEditingCell({ day, meal, isOpen: true });
    setNewDishName("");
    setNewDishDescription("");
  };

  const handleAddDish = () => {
    if (!newDishName.trim()) return;

    const updatedMenu = { ...currentMenu };
    const newDish = {
      name: newDishName,
      description: newDishDescription,
      dietary: newDishDietary,
    };

    updatedMenu[editingCell.day][editingCell.meal].push(newDish);
    setCurrentMenu(updatedMenu);
    setNewDishName("");
    setNewDishDescription("");
  };

  const handleRemoveDish = (day, meal, index) => {
    const updatedMenu = { ...currentMenu };
    updatedMenu[day][meal].splice(index, 1);
    setCurrentMenu(updatedMenu);
  };

  const getDishBgColor = (dietary) => {
    return dietary === "Veg" 
      ? "bg-green-50 border-l-4 border-green-500" 
      : "bg-orange-50 border-l-4 border-orange-500";
  };

  const getDishTextColor = (dietary) => {
    return dietary === "Veg" ? "text-green-800" : "text-orange-800";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Mess Menu</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <Calendar size={16} />
              <span>Week of Oct 28 - Nov 3, 2024</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors font-medium ${
              isEditMode 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Edit2 className="w-5 h-5" />
            {isEditMode ? "Save & Exit" : "Edit Menu"}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 mt-6 border-b border-gray-200">
          <button className="pb-3 text-gray-500 hover:text-gray-700 transition font-medium">
            Previous
          </button>
          <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Current
          </button>
          <button className="pb-3 text-gray-500 hover:text-gray-700 transition font-medium">
            Next
          </button>
        </div>
      </div>

      {/* Menu Grid Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header Row */}
          <div className="grid grid-cols-5 bg-gray-50 border-b-2 border-gray-200 min-w-[1000px]">
            <div className="px-4 py-4 font-bold text-gray-900">Day</div>
            {MEALS.map((meal) => (
              <div key={meal} className="px-4 py-4">
                <p className="font-bold text-gray-900 text-center">{meal}</p>
                <p className="text-xs text-gray-600 font-normal text-center mt-1">
                  {MEAL_TIMES[meal]}
                </p>
              </div>
            ))}
          </div>

          {/* Day Rows */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="grid grid-cols-5 border-b hover:bg-gray-50 transition-colors min-w-[1000px]"
            >
              <div className="px-4 py-4 font-semibold text-gray-900 bg-gray-50 border-r">
                {day}
              </div>

              {MEALS.map((meal) => {
                const dishes = currentMenu[day]?.[meal] || [];

                return (
                  <div
                    key={`${day}-${meal}`}
                    className="px-4 py-4 cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => handleEditCell(day, meal)}
                  >
                    <div className="space-y-2 min-h-[120px]">
                      {dishes.map((dish, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${getDishBgColor(dish.dietary)}`}
                        >
                          <p className={`font-semibold ${getDishTextColor(dish.dietary)}`}>
                            {dish.name}
                          </p>
                          {dish.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {dish.description}
                            </p>
                          )}
                          {isEditMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDish(day, meal, index);
                              }}
                              className="text-red-600 hover:text-red-700 font-medium text-xs mt-2 flex items-center gap-1"
                            >
                              <X size={12} />
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ day, meal, isOpen: true });
                          }}
                          className="text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg py-2 px-3 w-full text-left flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Dish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-8 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-50 border-l-4 border-green-500 rounded"></div>
            <span className="text-gray-700 font-medium">Vegetarian</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-50 border-l-4 border-orange-500 rounded"></div>
            <span className="text-gray-700 font-medium">Non-Vegetarian</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCell.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit {editingCell.meal} - {editingCell.day}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Existing Dishes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(currentMenu[editingCell.day]?.[editingCell.meal] || []).map((dish, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{dish.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className={dish.dietary === "Veg" ? "text-green-600" : "text-orange-600"}>
                            {dish.dietary}
                          </span>
                        </p>
                        {dish.description && (
                          <p className="text-xs text-gray-600 mt-1">{dish.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveDish(editingCell.day, editingCell.meal, index)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Dish */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Add New Dish</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      placeholder="Enter dish name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Ingredients)
                    </label>
                    <input
                      type="text"
                      value={newDishDescription}
                      onChange={(e) => setNewDishDescription(e.target.value)}
                      placeholder="e.g., Rice, Dal, Curry, Roti"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newDishDietary}
                      onChange={(e) => setNewDishDietary(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-veg">Non-Vegetarian</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddDish}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Dish
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditingCell({ day: "", meal: "", isOpen: false });
                  setNewDishName("");
                  setNewDishDescription("");
                }}
                className="w-full px-4 py-2.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}