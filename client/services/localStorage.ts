import {
  Room,
  Student,
  MaintenanceRequest,
  Complaint,
  WeeklyMenu,
  FoodRequest,
  Announcement,
  Activity,
  Payment,
} from "@/types";

const STORAGE_KEYS = {
  ROOMS: "hostelWarden_rooms",
  STUDENTS: "hostelWarden_students",
  MAINTENANCE: "hostelWarden_maintenance",
  COMPLAINTS: "hostelWarden_complaints",
  MENUS: "hostelWarden_menus",
  FOOD_REQUESTS: "hostelWarden_foodRequests",
  ANNOUNCEMENTS: "hostelWarden_announcements",
  ACTIVITIES: "hostelWarden_activities",
  PAYMENTS: "hostelWarden_payments",
  INITIALIZED: "hostelWarden_initialized",
};

export const localStorageService = {
  // Generic get/set operations with error handling
  setData: <T>(key: string, data: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      return false;
    }
  },

  getData: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading data from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  // Room operations
  getRooms: (): Room[] => {
    return localStorageService.getData(STORAGE_KEYS.ROOMS, []);
  },

  setRooms: (rooms: Room[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.ROOMS, rooms);
  },

  getRoomById: (roomId: string): Room | null => {
    const rooms = localStorageService.getRooms();
    return rooms.find((r) => r.id === roomId) || null;
  },

  updateRoom: (roomId: string, updates: Partial<Room>): boolean => {
    const rooms = localStorageService.getRooms();
    const index = rooms.findIndex((r) => r.id === roomId);
    if (index === -1) return false;
    rooms[index] = {
      ...rooms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setRooms(rooms);
  },

  addRoom: (room: Room): boolean => {
    const rooms = localStorageService.getRooms();
    rooms.push(room);
    return localStorageService.setRooms(rooms);
  },

  // Student operations
  getStudents: (): Student[] => {
    return localStorageService.getData(STORAGE_KEYS.STUDENTS, []);
  },

  setStudents: (students: Student[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.STUDENTS, students);
  },

  getStudentById: (studentId: string): Student | null => {
    const students = localStorageService.getStudents();
    return students.find((s) => s.id === studentId) || null;
  },

  getStudentsByRoom: (roomId: string): Student[] => {
    const students = localStorageService.getStudents();
    return students.filter((s) => s.roomId === roomId);
  },

  addStudent: (student: Student): boolean => {
    const students = localStorageService.getStudents();
    students.push(student);
    return localStorageService.setStudents(students);
  },

  updateStudent: (studentId: string, updates: Partial<Student>): boolean => {
    const students = localStorageService.getStudents();
    const index = students.findIndex((s) => s.id === studentId);
    if (index === -1) return false;
    students[index] = {
      ...students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setStudents(students);
  },

  // Maintenance operations
  getMaintenanceRequests: (): MaintenanceRequest[] => {
    return localStorageService.getData(STORAGE_KEYS.MAINTENANCE, []);
  },

  setMaintenanceRequests: (requests: MaintenanceRequest[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.MAINTENANCE, requests);
  },

  addMaintenanceRequest: (request: MaintenanceRequest): boolean => {
    const requests = localStorageService.getMaintenanceRequests();
    requests.push(request);
    return localStorageService.setMaintenanceRequests(requests);
  },

  updateMaintenanceRequest: (
    requestId: string,
    updates: Partial<MaintenanceRequest>,
  ): boolean => {
    const requests = localStorageService.getMaintenanceRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return false;
    requests[index] = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setMaintenanceRequests(requests);
  },

  // Complaint operations
  getComplaints: (): Complaint[] => {
    return localStorageService.getData(STORAGE_KEYS.COMPLAINTS, []);
  },

  setComplaints: (complaints: Complaint[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.COMPLAINTS, complaints);
  },

  addComplaint: (complaint: Complaint): boolean => {
    const complaints = localStorageService.getComplaints();
    complaints.push(complaint);
    return localStorageService.setComplaints(complaints);
  },

  updateComplaint: (
    complaintId: string,
    updates: Partial<Complaint>,
  ): boolean => {
    const complaints = localStorageService.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return false;
    complaints[index] = {
      ...complaints[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setComplaints(complaints);
  },

  // Menu operations
  getMenus: (): WeeklyMenu[] => {
    return localStorageService.getData(STORAGE_KEYS.MENUS, []);
  },

  setMenus: (menus: WeeklyMenu[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.MENUS, menus);
  },

  getMenuByWeek: (week: number, year: number): WeeklyMenu | null => {
    const menus = localStorageService.getMenus();
    return menus.find((m) => m.week === week && m.year === year) || null;
  },

  addMenu: (menu: WeeklyMenu): boolean => {
    const menus = localStorageService.getMenus();
    menus.push(menu);
    return localStorageService.setMenus(menus);
  },

  updateMenu: (menuId: string, updates: Partial<WeeklyMenu>): boolean => {
    const menus = localStorageService.getMenus();
    const index = menus.findIndex((m) => m.id === menuId);
    if (index === -1) return false;
    menus[index] = {
      ...menus[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setMenus(menus);
  },

  // Food Request operations
  getFoodRequests: (): FoodRequest[] => {
    return localStorageService.getData(STORAGE_KEYS.FOOD_REQUESTS, []);
  },

  setFoodRequests: (requests: FoodRequest[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.FOOD_REQUESTS, requests);
  },

  addFoodRequest: (request: FoodRequest): boolean => {
    const requests = localStorageService.getFoodRequests();
    requests.push(request);
    return localStorageService.setFoodRequests(requests);
  },

  updateFoodRequest: (
    requestId: string,
    updates: Partial<FoodRequest>,
  ): boolean => {
    const requests = localStorageService.getFoodRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return false;
    requests[index] = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setFoodRequests(requests);
  },

  // Announcement operations
  getAnnouncements: (): Announcement[] => {
    return localStorageService.getData(STORAGE_KEYS.ANNOUNCEMENTS, []);
  },

  setAnnouncements: (announcements: Announcement[]): boolean => {
    return localStorageService.setData(
      STORAGE_KEYS.ANNOUNCEMENTS,
      announcements,
    );
  },

  addAnnouncement: (announcement: Announcement): boolean => {
    const announcements = localStorageService.getAnnouncements();
    announcements.push(announcement);
    return localStorageService.setAnnouncements(announcements);
  },

  updateAnnouncement: (
    announcementId: string,
    updates: Partial<Announcement>,
  ): boolean => {
    const announcements = localStorageService.getAnnouncements();
    const index = announcements.findIndex((a) => a.id === announcementId);
    if (index === -1) return false;
    announcements[index] = {
      ...announcements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localStorageService.setAnnouncements(announcements);
  },

  // Activity operations
  getActivities: (): Activity[] => {
    return localStorageService.getData(STORAGE_KEYS.ACTIVITIES, []);
  },

  setActivities: (activities: Activity[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.ACTIVITIES, activities);
  },

  addActivity: (activity: Activity): boolean => {
    const activities = localStorageService.getActivities();
    activities.push(activity);
    return localStorageService.setActivities(activities);
  },

  // Payment operations
  getPayments: (): Payment[] => {
    return localStorageService.getData(STORAGE_KEYS.PAYMENTS, []);
  },

  setPayments: (payments: Payment[]): boolean => {
    return localStorageService.setData(STORAGE_KEYS.PAYMENTS, payments);
  },

  addPayment: (payment: Payment): boolean => {
    const payments = localStorageService.getPayments();
    payments.push(payment);
    return localStorageService.setPayments(payments);
  },

  // Initialization check
  isInitialized: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === "true";
  },

  markInitialized: (): boolean => {
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
      return true;
    } catch (error) {
      console.error("Error marking initialized:", error);
      return false;
    }
  },

  // Clear all data
  clearAll: (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};
