import { useState, useEffect } from 'react';
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
    if (!isEditMode) return;
    setEditingCell({ day, meal, isOpen: true });
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

  const getDietaryColor = (dietary: string) => {
    return dietary === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
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
      <div className="flex items-center justify-between mb-6">
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
        <div className="flex gap-3 text-center">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Previous
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Current
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Next
          </button>
        </div>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-20">Day</th>
              {MEALS.map((meal) => (
                <th key={meal} className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  <div>{meal}</div>
                  <div className="text-xs font-normal text-gray-600">
                    {MEAL_TIMES[meal as keyof typeof MEAL_TIMES]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-b">
                <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50">{day}</td>
                {MEALS.map((meal) => {
                  const dayData = currentMenu[day as keyof WeeklyMenu] as any;
                  const dishes = dayData?.[meal] || [];
                  const isDominantlyVeg = dishes.some((d: MenuItem) => d.dietary === 'Veg');

                  return (
                    <td
                      key={`${day}-${meal}`}
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        isDominantlyVeg ? 'bg-green-50' : 'bg-orange-50'
                      }`}
                      onClick={() => handleEditCell(day, meal)}
                    >
                      <div className="space-y-2">
                        {dishes.map((dish: MenuItem, index: number) => (
                          <div key={index} className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{dish.name}</p>
                              <p className="text-xs text-gray-600">{dish.dietary}</p>
                            </div>
                            {isEditMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({ day, meal, isOpen: true });
                                  handleRemoveDish(index);
                                }}
                                className="text-red-600 hover:text-red-700 font-bold"
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
                              setEditingCell({ day, meal, isOpen: true });
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
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-700">Vegetarian</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
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
          }}
          title={`Edit ${editingCell.meal} - ${editingCell.day}`}
          size="md"
        >
          <div className="space-y-4">
            {/* Existing Dishes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Current Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {((currentMenu[editingCell.day as keyof WeeklyMenu] as any)?.[editingCell.meal] || []).map(
                  (dish: MenuItem, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{dish.name}</p>
                        <p className="text-xs text-gray-500">{dish.dietary}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDish(index)}
                        className="text-red-600 hover:text-red-700 font-bold"
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
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
