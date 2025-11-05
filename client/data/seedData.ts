import { localStorageService } from "@/services/localStorage";
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

const FIRST_NAMES = [
  "Rajesh",
  "Priya",
  "Amit",
  "Sneha",
  "Vikram",
  "Ananya",
  "Arjun",
  "Neha",
  "Rohan",
  "Divya",
  "Aditya",
  "Pooja",
  "Nikhil",
  "Sara",
  "Varun",
  "Isha",
];

const LAST_NAMES = [
  "Kumar",
  "Singh",
  "Patel",
  "Gupta",
  "Sharma",
  "Verma",
  "Rao",
  "Nair",
  "Chatterjee",
  "Mishra",
  "Joshi",
  "Iyer",
  "Menon",
  "Desai",
  "Bhat",
  "Saxena",
];

const DEPARTMENTS: Array<"CSE" | "ECE" | "ME" | "CE"> = [
  "CSE",
  "ECE",
  "ME",
  "CE",
];
const BLOCKS: Array<"A" | "B" | "C"> = ["A", "B", "C"];
const FLOORS: Array<"Ground" | "1st" | "2nd" | "3rd"> = [
  "Ground",
  "1st",
  "2nd",
  "3rd",
];
const CAPACITIES: Array<"Single" | "Double" | "Triple"> = [
  "Single",
  "Double",
  "Triple",
];

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const floors: Array<"Ground" | "1st" | "2nd" | "3rd"> = [
    "Ground",
    "1st",
    "2nd",
    "3rd",
  ];
  const blocks: Array<"A" | "B" | "C"> = ["A", "B", "C"];
  const capacities: Array<"Single" | "Double" | "Triple"> = [
    "Single",
    "Double",
    "Triple",
  ];

  let roomNumber = 100;
  floors.forEach((floor) => {
    blocks.forEach((block) => {
      for (let i = 0; i < 10; i++) {
        const capacity =
          capacities[Math.floor(Math.random() * capacities.length)];
        const capacityNum =
          capacity === "Single" ? 1 : capacity === "Double" ? 2 : 3;
        const status =
          Math.random() > 0.3
            ? "Occupied"
            : Math.random() > 0.5
              ? "Empty"
              : "Maintenance";
        const occupancy =
          status === "Empty" ? 0 : Math.floor(Math.random() * capacityNum) + 1;

        rooms.push({
          id: generateId(),
          number: `${block}-${roomNumber}`,
          floor,
          block,
          capacity,
          occupancy,
          status,
          amenities: {
            fans: capacityNum,
            lights: capacityNum,
            tables: capacityNum,
            chairs: capacityNum,
            beds: capacityNum,
            cupboards: capacityNum,
          },
          amenityStatus: {
            fans: Math.random() > 0.1 ? "Working" : "Faulty",
            lights: Math.random() > 0.1 ? "Working" : "Faulty",
            tables: Math.random() > 0.1 ? "Working" : "Faulty",
            chairs: Math.random() > 0.1 ? "Working" : "Faulty",
            beds: Math.random() > 0.1 ? "Working" : "Faulty",
            cupboards: Math.random() > 0.1 ? "Working" : "Faulty",
          },
          lastInspection: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          maintenanceIssue:
            status === "Maintenance" ? "Plumbing issue in bathroom" : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        roomNumber++;
      }
    });
  });

  return rooms;
};

const generateStudents = (rooms: Room[]): Student[] => {
  const students: Student[] = [];
  const sessions = ["2024-25", "2023-24", "2022-23"];

  for (let i = 0; i < 200; i++) {
    const firstName =
      FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const semester = Math.floor(Math.random() * 8) + 1;
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    const rollNum = `${dept}${semester}${String(i + 1).padStart(3, "0")}`;
    const paymentStatus = Math.random() > 0.2 ? "Paid" : "Unpaid";

    // Find an occupied room with available space
    const occupiedRooms = rooms.filter(
      (r) =>
        r.status === "Occupied" && r.occupancy < parseInt(r.capacity.charAt(0)),
    );
    const room =
      occupiedRooms.length > 0
        ? occupiedRooms[Math.floor(Math.random() * occupiedRooms.length)]
        : rooms[Math.floor(Math.random() * rooms.length)];

    students.push({
      id: generateId(),
      fullName: `${firstName} ${lastName}`,
      rollNumber: rollNum,
      universityRollNumber: `PEC${session.split("-")[0]}${rollNum}`,
      class: dept,
      semester,
      session,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`,
      mobileNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      emergencyContact: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      fathersName: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${lastName}`,
      dob: new Date(
        1998 + Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      ).toISOString(),
      bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"][
        Math.floor(Math.random() * 8)
      ],
      address: `${Math.floor(Math.random() * 1000)} Main Street, City`,
      roomId: room.id,
      bedNumber: Math.floor(Math.random() * 3) + 1,
      paymentStatus,
      paymentDetails:
        paymentStatus === "Paid"
          ? {
              transactionId: `TXN${generateId()}`,
              paidAmount: 30000,
              paidDate: new Date(
                Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            }
          : { paidAmount: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return students;
};

const generateMaintenanceRequests = (rooms: Room[]): MaintenanceRequest[] => {
  const requests: MaintenanceRequest[] = [];
  const categories: Array<
    "Electrical" | "Plumbing" | "Furniture" | "Cleaning" | "Other"
  > = ["Electrical", "Plumbing", "Furniture", "Cleaning", "Other"];
  const statuses: Array<"Pending" | "In Progress" | "Resolved"> = [
    "Pending",
    "In Progress",
    "Resolved",
  ];

  for (let i = 0; i < 15; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reportedDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );

    requests.push({
      id: generateId(),
      title: [
        "Broken window",
        "Leaking tap",
        "Faulty light",
        "Door hinge broken",
        "Water damage",
      ][Math.floor(Math.random() * 5)],
      description: "Issue reported by student - needs immediate attention",
      roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)] as
        | "High"
        | "Medium"
        | "Low",
      status,
      reportedBy: `Student ${Math.floor(Math.random() * 100)}`,
      reportedDate: reportedDate.toISOString(),
      assignedTechnician:
        status !== "Pending"
          ? `Technician ${Math.floor(Math.random() * 10)}`
          : undefined,
      startedDate:
        status !== "Pending"
          ? new Date(reportedDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      estimatedCompletion:
        status !== "Pending"
          ? new Date(
              reportedDate.getTime() + 5 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined,
      resolvedDate:
        status === "Resolved"
          ? new Date(
              reportedDate.getTime() + 4 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined,
      resolutionNotes:
        status === "Resolved" ? "Issue fixed successfully" : undefined,
      progressPercentage:
        status === "Pending"
          ? 0
          : status === "In Progress"
            ? Math.floor(Math.random() * 100)
            : 100,
      photosCount: Math.floor(Math.random() * 4),
      condition: ["Critical", "Moderate", "Minor"][
        Math.floor(Math.random() * 3)
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return requests;
};

const generateComplaints = (students: Student[]): Complaint[] => {
  const complaints: Complaint[] = [];
  const types = ["Noise", "Cleanliness", "Safety", "Food Quality", "Others"];
  const statuses: Array<"Pending" | "Resolved"> = ["Pending", "Resolved"];

  for (let i = 0; i < 8; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reportedDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );

    complaints.push({
      id: generateId(),
      studentId: students[Math.floor(Math.random() * students.length)].id,
      type: types[Math.floor(Math.random() * types.length)],
      description: "Student complaint about hostel conditions",
      urgency: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)] as
        | "High"
        | "Medium"
        | "Low",
      status,
      reportedDate: reportedDate.toISOString(),
      resolvedDate:
        status === "Resolved"
          ? new Date(
              reportedDate.getTime() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined,
      resolutionNotes: status === "Resolved" ? "Issue resolved" : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return complaints;
};

const generateMenus = (): WeeklyMenu[] => {
  const menus: WeeklyMenu[] = [];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const createMealType = () => ({
    Breakfast: [
      {
        name: "Paratha, Butter, Tea",
        time: "8:00 AM",
        dietary: "Veg" as const,
        allergens: ["dairy"],
      },
    ],
    Lunch: [
      {
        name: "Rice, Daal, Paneer Curry, Roti",
        time: "12:30 PM",
        dietary: "Veg" as const,
        allergens: ["dairy"],
      },
    ],
    Snacks: [
      {
        name: "Tea, Samosa",
        time: "4:00 PM",
        dietary: "Veg" as const,
        allergens: [],
      },
    ],
    Dinner: [
      {
        name: "Roti, Chicken Curry, Rice",
        time: "7:30 PM",
        dietary: "Non-veg" as const,
        allergens: [],
      },
    ],
  });

  const currentWeek = Math.floor(
    (Date.now() - new Date(2024, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  for (let i = -1; i <= 1; i++) {
    const week = currentWeek + i;
    const menu: any = {
      id: generateId(),
      week,
      year: 2024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    days.forEach((day) => {
      menu[day] = createMealType();
    });

    menus.push(menu);
  }

  return menus;
};

const generateFoodRequests = (): FoodRequest[] => {
  const requests: FoodRequest[] = [];
  const dishes = [
    "Samosa",
    "Biryani",
    "Momos",
    "Pasta",
    "Pizza",
    "Ice Cream",
    "Chocolate Cake",
    "Sushi",
  ];

  for (let i = 0; i < 10; i++) {
    const createdDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );
    const closingDate = new Date(
      createdDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    requests.push({
      id: generateId(),
      dishName: dishes[Math.floor(Math.random() * dishes.length)],
      description: "A delicious and popular dish that students love",
      mealType: ["Breakfast", "Lunch", "Snacks", "Dinner"][
        Math.floor(Math.random() * 4)
      ] as any,
      dietary: ["Veg", "Non-veg", "Both"][Math.floor(Math.random() * 3)] as any,
      whyWantThis: "Students would love to have this dish more often",
      votes: Math.floor(Math.random() * 100),
      votedBy: [],
      status: Math.random() > 0.3 ? "Active" : "Completed",
      createdDate: createdDate.toISOString(),
      closingDate: closingDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return requests;
};

const generateAnnouncements = (): Announcement[] => {
  const announcements: Announcement[] = [];
  const types: Array<
    "General" | "Urgent" | "Event" | "Maintenance" | "Notice"
  > = ["General", "Urgent", "Event", "Maintenance", "Notice"];

  for (let i = 0; i < 5; i++) {
    const createdDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );

    announcements.push({
      id: generateId(),
      title: `Announcement ${i + 1}`,
      content: "This is an important announcement for all hostel students",
      type: types[Math.floor(Math.random() * types.length)],
      priority: ["Low", "Medium", "High", "Critical"][
        Math.floor(Math.random() * 4)
      ] as any,
      targetAudience: { allStudents: true },
      visibility: {
        startDate: createdDate.toISOString(),
        displayUntilRemoved: true,
      },
      attachments: [],
      notifications: {
        email: true,
        sms: false,
        push: true,
        noticeBoard: true,
      },
      status: "Active",
      views: Math.floor(Math.random() * 100),
      postedBy: "Warden",
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
    });
  }

  return announcements;
};

const generateActivities = (): Activity[] => {
  const activities: Activity[] = [];
  const types = [
    "Student Allocated",
    "Payment Received",
    "Maintenance Reported",
    "Complaint Filed",
    "Announcement Posted",
  ];

  for (let i = 0; i < 10; i++) {
    activities.push({
      id: generateId(),
      type: types[Math.floor(Math.random() * types.length)] as any,
      description: `Activity ${i + 1}`,
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  return activities;
};

export const seedInitialData = (): void => {
  if (localStorageService.isInitialized()) {
    return;
  }

  const rooms = generateRooms();
  const students = generateStudents(rooms);
  const maintenance = generateMaintenanceRequests(rooms);
  const complaints = generateComplaints(students);
  const menus = generateMenus();
  const foodRequests = generateFoodRequests();
  const announcements = generateAnnouncements();
  const activities = generateActivities();

  localStorageService.setRooms(rooms);
  localStorageService.setStudents(students);
  localStorageService.setMaintenanceRequests(maintenance);
  localStorageService.setComplaints(complaints);
  localStorageService.setMenus(menus);
  localStorageService.setFoodRequests(foodRequests);
  localStorageService.setAnnouncements(announcements);
  localStorageService.setActivities(activities);
  localStorageService.markInitialized();
};
