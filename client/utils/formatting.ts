import { Room, Student } from "@/types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDateWithTime = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const calculateOccupancyRate = (rooms: Room[]): number => {
  if (rooms.length === 0) return 0;

  const totalOccupied = rooms.reduce((sum, room) => {
    return sum + (room.status === "Occupied" ? room.occupancy : 0);
  }, 0);

  const totalCapacity = rooms.reduce((sum, room) => {
    const capacityNum =
      room.capacity === "Single" ? 1 : room.capacity === "Double" ? 2 : 3;
    return sum + capacityNum;
  }, 0);

  return totalCapacity > 0
    ? Math.round((totalOccupied / totalCapacity) * 100)
    : 0;
};

export const getStudentsByRoom = (
  students: Student[],
  roomId: string,
): Student[] => {
  return students.filter((s) => s.roomId === roomId);
};

export const getRoomById = (rooms: Room[], roomId: string): Room | null => {
  return rooms.find((r) => r.id === roomId) || null;
};

export const getStudentById = (
  students: Student[],
  studentId: string,
): Student | null => {
  return students.find((s) => s.id === studentId) || null;
};

export const validateRollNo = (rollNo: string): boolean => {
  // Format: CSE1001 or CSE1001001
  const regex = /^[A-Z]{2,3}\d{1,7}$/;
  return regex.test(rollNo);
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateMobileNumber = (phone: string): boolean => {
  const regex = /^\d{10}$/;
  return regex.test(phone);
};

export const isOverdue = (dueDate: string | Date): boolean => {
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return new Date() > date;
};

export const getCurrentWeek = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
  return weekNumber;
};

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const group = String(item[key]);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
};

export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle commas and quotes in values
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateReceiptNo = (): string => {
  return `RCP${Date.now()}${Math.random().toString(36).substring(2, 5)}`;
};

export const calculateFine = (
  dueDate: string,
  ratePerDay: number = 10,
): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * ratePerDay;
};

export const getDaysUntil = (date: string | Date): number => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(targetDate);
};

export const getCapacityNumber = (
  capacity: "Single" | "Double" | "Triple",
): number => {
  return capacity === "Single" ? 1 : capacity === "Double" ? 2 : 3;
};

export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
