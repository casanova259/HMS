import { useState, useEffect, useMemo } from 'react';
import { Edit2, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { localStorageService } from '@/services/localStorage';
import { getCurrentWeek } from '@/utils/formatting';
import { WeeklyMenu, MenuItem } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const MEAL_TIMES = {
  Breakfast: '7:30 - 9:00 AM',
  Lunch: '12:30 - 2:00 PM',
  Snacks: '5:00 - 6:00 PM',
  Dinner: '7:30 - 9:00 PM',
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
    day: '',
    meal: '',
    isOpen: false,
  });
  const [newDishName, setNewDishName] = useState('');
  const [newDishDietary, setNewDishDietary] = useState<'Veg' | 'Non-veg'>('Veg');
  const [selectedDishIndex, setSelectedDishIndex] = useState<number | null>(null);

  useEffect(() => {
    const allMenus = localStorageService.getMenus();
    setMenus(allMenus);
    const menu = allMenus.find((m) => m.week === currentWeek && m.year === 2024);
    setCurrentMenu(menu || null);
  }, [currentWeek]);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev + 1);
  };

  const handleEditCell = (day: string, meal: string) => {
    setEditingCell({ day, meal, isOpen: true });
    setSelectedDishIndex(null);
    setNewDishName('');
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
    };

    dayData[editingCell.meal].push(newDish);
    
    localStorageService.updateMenu(currentMenu.id, updatedMenu);
    setMenus(localStorageService.getMenus());
    setCurrentMenu(updatedMenu);
    setNewDishName('');
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

  const handleSaveMenu = () => {
    setIsEditMode(false);
    setEditingCell({ day: '', meal: '', isOpen: false });
  };

  const getDietaryColor = (dietary: string) => {
    return dietary === 'Veg' ? 'bg-green-100' : 'bg-orange-100';
  };

  const getDietaryTextColor = (dietary: string) => {
    return dietary === 'Veg' ? 'text-green-800' : 'text-orange-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Mess Menu</h1>
          <p className="text-gray-600 mt-2">Week of Oct 28 - Nov 3, 2024</p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          {isEditMode ? 'Done Editing' : 'Edit Menu'}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center min-w-48">
          <p className="text-sm text-gray-600">Current Week</p>
          <p className="text-lg font-semibold text-gray-900">Week {currentWeek}</p>
        </div>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Day</th>
              {MEALS.map((meal) => (
                <th key={meal} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {meal} <span className="text-xs text-gray-500">{MEAL_TIMES[meal as keyof typeof MEAL_TIMES]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900 w-24">{day}</td>
                {MEALS.map((meal) => {
                  const dayData = currentMenu[day as keyof WeeklyMenu] as any;
                  const dishes = dayData?.[meal] || [];

                  return (
                    <td
                      key={`${day}-${meal}`}
                      className={`px-6 py-4 cursor-pointer hover:bg-opacity-75 transition-colors ${
                        dishes.length > 0 && dishes[0].dietary === 'Veg'
                          ? 'bg-green-50'
                          : 'bg-orange-50'
                      }`}
                      onClick={() => isEditMode && handleEditCell(day, meal)}
                    >
                      <div className="space-y-1">
                        {dishes.map((dish: MenuItem, index: number) => (
                          <div
                            key={index}
                            className={`text-sm font-medium p-2 rounded ${getDietaryColor(
                              dish.dietary
                            )} ${getDietaryTextColor(dish.dietary)}`}
                          >
                            {dish.name}
                            {isEditMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({ day, meal, isOpen: true });
                                  setSelectedDishIndex(index);
                                }}
                                className="ml-1 text-red-600 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        {isEditMode && dishes.length === 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCell(day, meal);
                            }}
                            className="text-blue-600 text-xs font-medium hover:text-blue-700"
                          >
                            + Add items
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-700">Vegetarian</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 rounded"></div>
          <span className="text-gray-700">Non-vegetarian</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCell.isOpen && currentMenu && (
        <Modal
          isOpen={editingCell.isOpen}
          onClose={() => {
            setEditingCell({ day: '', meal: '', isOpen: false });
            setNewDishName('');
            setSelectedDishIndex(null);
          }}
          title={`Edit ${editingCell.meal} - ${editingCell.day}`}
          size="md"
        >
          <div className="space-y-4">
            {/* Existing Dishes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Current Items</h4>
              <div className="space-y-2">
                {((currentMenu[editingCell.day as keyof WeeklyMenu] as any)?.[editingCell.meal] || []).map(
                  (dish: MenuItem, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{dish.name}</p>
                        <p className="text-xs text-gray-500">{dish.dietary}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDish(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Add New Dish */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Item</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Enter dish name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newDishDietary}
                    onChange={(e) => setNewDishDietary(e.target.value as 'Veg' | 'Non-veg')}
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
                  Add Item
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setEditingCell({ day: '', meal: '', isOpen: false });
                  setNewDishName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingCell({ day: '', meal: '', isOpen: false });
                  setNewDishName('');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
