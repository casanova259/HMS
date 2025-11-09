// Room related types
export interface Room {
  id: string;
  number: string;
  floor: "Ground" | "1st" | "2nd" | "3rd";
  block: "A" | "B" | "C";
  capacity: "Single" | "Double" | "Triple";
  occupancy: number;
  status: "Occupied" | "Empty" | "Maintenance";
  amenities: {
    fans: number;
    lights: number;
    tables: number;
    chairs: number;
    beds: number;
    cupboards: number;
  };
  amenityStatus: {
    [key: string]: "Working" | "Faulty";
  };
  lastInspection: string;
  maintenanceIssue?: string;
  allocationDetails?: {
    studentIds: string[];
    bedAllocations: {
      bed: number;
      studentId: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

// Student related types
export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  universityRollNumber: string;
  class: "CSE" | "ECE" | "ME" | "CE";
  semester: number;
  session: string;
  email: string;
  mobileNumber: string;
  emergencyContact: string;
  fathersName?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  previousHostel?: string;
  medicalConditions?: string;
  allergyInformation?: string;
  roomId?: string;
  bedNumber?: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  paymentDetails?: {
    transactionId?: string;
    paidAmount: number;
    paidDate?: string;
  };
  documents?: {
    photo?: string;
    idProof?: string;
    medicalCertificate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Maintenance related types
export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  roomId: string;
  category: "Electrical" | "Plumbing" | "Furniture" | "Cleaning" | "Other";
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Resolved";
  reportedBy: string;
  reportedDate: string;
  assignedTechnician?: string;
  startedDate?: string;
  estimatedCompletion?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  progressPercentage: number;
  photosCount: number;
  condition?: string;
  createdAt: string;
  updatedAt: string;
}

// Complaint related types
export interface Complaint {
  id: string;
  studentId: string;
  type: string;
  description: string;
  urgency: "High" | "Medium" | "Low";
  status: "Pending" | "Resolved";
  reportedDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Menu related types
export interface MenuItem {
  name: string;
  time: string;
  dietary: "Veg" | "Non-veg" | "Both";
  allergens: string[];
  description?: string;
}

export interface MealType {
  Breakfast: MenuItem[];
  Lunch: MenuItem[];
  Snacks: MenuItem[];
  Dinner: MenuItem[];
}

export interface WeeklyMenu {
  id: string;
  week: number;
  year: number;
  Monday: MealType;
  Tuesday: MealType;
  Wednesday: MealType;
  Thursday: MealType;
  Friday: MealType;
  Saturday: MealType;
  Sunday: MealType;
  createdAt: string;
  updatedAt: string;
}

// Food Request related types
export interface FoodRequest {
  id: string;
  dishName: string;
  description: string;
  mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  dietary: "Veg" | "Non-veg" | "Both";
  whyWantThis: string;
  photo?: string;
  votes: number;
  votedBy: string[];
  status: "Active" | "Completed" | "Rejected";
  implementationStatus?: "Planned" | "Added to menu" | "Rejected";
  createdDate: string;
  closingDate: string;
  createdAt: string;
  updatedAt: string;
}

// Announcement related types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "General" | "Urgent" | "Event" | "Maintenance" | "Notice";
  priority: "Low" | "Medium" | "High" | "Critical";
  targetAudience: {
    allStudents: boolean;
    floors?: string[];
    blocks?: string[];
    roomRange?: {
      from: string;
      to: string;
    };
  };
  visibility: {
    startDate: string;
    endDate?: string;
    displayUntilRemoved: boolean;
  };
  attachments: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    noticeBoard: boolean;
  };
  status: "Draft" | "Scheduled" | "Active" | "Archived";
  views: number;
  postedBy: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Activity related types
export interface Activity {
  id: string;
  type:
    | "Student Allocated"
    | "Payment Received"
    | "Maintenance Reported"
    | "Complaint Filed"
    | "Announcement Posted"
    | "Menu Updated";
  description: string;
  timestamp: string;
  relatedId?: string;
  data?: any;
}

// Payment related types
export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  type: "Hostel Fee" | "Security Deposit";
  transactionId: string;
  status: "Paid" | "Pending";
  date: string;
  method?: string;
  createdAt: string;
  updatedAt: string;
}

// No Due Form related types
export interface NoDueForm {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  requestDate: string;
  libraryStatus: "Pending" | "Approved" | "Rejected";
  libraryApprovedDate?: string;
  wardenStatus: "Pending" | "Approved" | "Rejected";
  wardenApprovedDate?: string;
  wardenNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  emptyRooms: number;
  maintenanceRooms: number;
  totalStudents: number;
  paidStudents: number;
  unpaidStudents: number;
  pendingMaintenance: number;
  unresolvedComplaints: number;
  occupancyRate: number;
}
