import { useState, useEffect } from "react";
import { Edit2, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { localStorageService } from "@/services/localStorage";
import { getCurrentWeek, formatDate } from "@/utils/formatting";
import { WeeklyMenu, MenuItem } from "@/types";

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

interface EditingState {
  day: string;
  meal: string;
  isOpen: boolean;
}

export default function Menu() {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingState>({
    day: "",
    meal: "",
    isOpen: false,
  });
  const [newDishName, setNewDishName] = useState("");
  const [newDishDescription, setNewDishDescription] = useState("");
  const [newDishDietary, setNewDishDietary] = useState<"Veg" | "Non-veg">(
    "Veg",
  );

  useEffect(() => {
    const allMenus = localStorageService.getMenus();
    setMenus(allMenus);
    const menu = allMenus.find(
      (m) => m.week === currentWeek && m.year === 2024,
    );
    setCurrentMenu(menu || null);
  }, [currentWeek]);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev + 1);
  };

  const handleEditCell = (day: string, meal: string) => {
    if (!isEditMode) return;
    setEditingCell({ day, meal, isOpen: true });
    setNewDishName("");
    setNewDishDescription("");
  };

  const handleAddDish = () => {
    if (!newDishName.trim() || !currentMenu) return;

    const updatedMenu = { ...currentMenu };
    const dayData = updatedMenu[editingCell.day as keyof WeeklyMenu] as any;

    const newDish: MenuItem = {
      name: newDishName,
      time: MEAL_TIMES[editingCell.meal as keyof typeof MEAL_TIMES],
      dietary: newDishDietary,
      allergens: [],
      description: newDishDescription || undefined,
    };

    dayData[editingCell.meal].push(newDish);

    localStorageService.updateMenu(currentMenu.id, updatedMenu);
    setMenus(localStorageService.getMenus());
    setCurrentMenu(updatedMenu);
    setNewDishName("");
    setNewDishDescription("");
  };

  const handleRemoveDish = (index: number) => {
    if (!currentMenu) return;

    const updatedMenu = { ...currentMenu };
    const dayData = updatedMenu[editingCell.day as keyof WeeklyMenu] as any;
    dayData[editingCell.meal].splice(index, 1);

    localStorageService.updateMenu(currentMenu.id, updatedMenu);
    setMenus(localStorageService.getMenus());
    setCurrentMenu(updatedMenu);
  };

  const getDishBgColor = (dietary: string) => {
    if (dietary === "Veg") {
      return "bg-green-100 border-l-4 border-green-500";
    } else {
      return "bg-orange-100 border-l-4 border-orange-500";
    }
  };

  const getDishTextColor = (dietary: string) => {
    if (dietary === "Veg") {
      return "text-green-800";
    } else {
      return "text-orange-800";
    }
  };

  if (!currentMenu) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Menu not available for this week</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Mess Menu</h1>
          <p className="text-gray-600 mt-2">
            Week of{" "}
            {new Date(2024, 0, 1 + currentWeek * 7).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(2024, 0, 1 + currentWeek * 7 + 6).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Edit2 className="w-5 h-5" />
          Edit Menu
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
        >
          Previous
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          Current
        </button>
        <button
          onClick={handleNextWeek}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Menu Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header Row */}
            <div className="grid grid-cols-5 bg-gray-50 border-b-2 border-gray-200">
              <div className="px-4 py-4 font-bold text-gray-900">Day</div>
              {MEALS.map((meal) => (
                <div key={meal} className="px-4 py-4 font-bold text-gray-900">
                  <div className="text-center">
                    <p className="font-bold">{meal}</p>
                    <p className="text-xs text-gray-600 font-normal">
                      ({MEAL_TIMES[meal as keyof typeof MEAL_TIMES]})
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Day Rows */}
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-5 border-b hover:bg-gray-50 transition-colors">
                <div className="px-4 py-4 font-semibold text-gray-900 bg-gray-50 border-r">
                  {day}
                </div>

                {MEALS.map((meal) => {
                  const dayData = currentMenu[day as keyof WeeklyMenu] as any;
                  const dishes = dayData?.[meal] || [];

                  return (
                    <div
                      key={`${day}-${meal}`}
                      className="px-4 py-4 cursor-pointer transition-colors hover:bg-gray-100"
                      onClick={() => handleEditCell(day, meal)}
                    >
                      <div className="space-y-2 min-h-24">
                        {dishes.map((dish: MenuItem, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded text-sm ${getDishBgColor(
                              dish.dietary,
                            )}`}
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
                                  setEditingCell({ day, meal, isOpen: true });
                                  handleRemoveDish(index);
                                }}
                                className="text-red-600 hover:text-red-700 font-bold text-xs mt-2"
                              >
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
                            className="text-blue-600 text-xs font-medium hover:text-blue-700 py-2 px-2 hover:bg-blue-50 rounded w-full"
                          >
                            + Add Dish
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
      </div>

      {/* Legend */}
      <div className="flex gap-8 justify-center text-sm p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-l-4 border-green-500 rounded"></div>
          <span className="text-gray-700">Vegetarian</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-100 border-l-4 border-orange-500 rounded"></div>
          <span className="text-gray-700">Non-Vegetarian</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCell.isOpen && currentMenu && (
        <Modal
          isOpen={editingCell.isOpen}
          onClose={() => {
            setEditingCell({ day: "", meal: "", isOpen: false });
            setNewDishName("");
            setNewDishDescription("");
          }}
          title={`Edit ${editingCell.meal} - ${editingCell.day}`}
          size="md"
        >
          <div className="space-y-4">
            {/* Existing Dishes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Current Items
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(
                  (currentMenu[editingCell.day as keyof WeeklyMenu] as any)?.[
                    editingCell.meal
                  ] || []
                ).map((dish: MenuItem, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{dish.name}</p>
                      <p className="text-xs text-gray-500">{dish.dietary}</p>
                      {dish.description && (
                        <p className="text-xs text-gray-600">{dish.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveDish(index)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Dish */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Dish</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dish Name
                  </label>
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Enter dish name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Ingredients)
                  </label>
                  <input
                    type="text"
                    value={newDishDescription}
                    onChange={(e) => setNewDishDescription(e.target.value)}
                    placeholder="e.g., Rice, Dal, Curry, Roti"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newDishDietary}
                    onChange={(e) =>
                      setNewDishDietary(e.target.value as "Veg" | "Non-veg")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-veg">Non-Vegetarian</option>
                  </select>
                </div>

                <button
                  onClick={handleAddDish}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Dish
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setEditingCell({ day: "", meal: "", isOpen: false });
                  setNewDishName("");
                  setNewDishDescription("");
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
