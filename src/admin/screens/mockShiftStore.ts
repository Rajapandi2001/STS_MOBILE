export interface Shift {
  id: string;
  code: string;
  name: string;
  type: 'Morning' | 'Evening' | 'Night';
  startTime: string;
  endTime: string;
  graceTime: number; // in minutes
  minWorkingHours: string; // e.g. "08:00"
  halfDayHours: string; // e.g. "04:00"
  status: 'Active' | 'Inactive';
}

let mockShifts: Shift[] = [
  {
    id: '1',
    code: 'SHFT-REG01',
    name: 'Regular Shift',
    type: 'Morning',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    graceTime: 15,
    minWorkingHours: '08:00',
    halfDayHours: '04:00',
    status: 'Active',
  },
  {
    id: '2',
    code: 'SHFT-EVE02',
    name: 'Evening Shift',
    type: 'Evening',
    startTime: '02:00 PM',
    endTime: '11:00 PM',
    graceTime: 15,
    minWorkingHours: '08:00',
    halfDayHours: '04:00',
    status: 'Active',
  },
  {
    id: '3',
    code: 'SHFT-NGT03',
    name: 'Night Shift',
    type: 'Night',
    startTime: '09:00 PM',
    endTime: '06:00 AM',
    graceTime: 15,
    minWorkingHours: '08:00',
    halfDayHours: '04:00',
    status: 'Active',
  },
  {
    id: '4',
    code: 'SHFT-WKD04',
    name: 'Weekend Shift',
    type: 'Morning',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    graceTime: 30,
    minWorkingHours: '05:00',
    halfDayHours: '03:00',
    status: 'Inactive',
  },
  {
    id: '5',
    code: 'SHFT-OVR08',
    name: 'Overtime Shift',
    type: 'Night',
    startTime: '06:00 PM',
    endTime: '03:00 AM',
    graceTime: 15,
    minWorkingHours: '08:00',
    halfDayHours: '04:00',
    status: 'Active',
  },
];

export const getShifts = (): Shift[] => {
  return mockShifts;
};

export const getShiftById = (id: string): Shift | undefined => {
  return mockShifts.find((s) => s.id === id);
};

export const addShift = (shift: Omit<Shift, 'id'>): Shift => {
  const newShift: Shift = {
    ...shift,
    id: Math.random().toString(36).substr(2, 9),
  };
  mockShifts = [...mockShifts, newShift];
  return newShift;
};

export const updateShift = (id: string, updated: Omit<Shift, 'id'>): Shift | undefined => {
  mockShifts = mockShifts.map((s) => (s.id === id ? { ...updated, id } : s));
  return mockShifts.find((s) => s.id === id);
};

export const deleteShift = (id: string): boolean => {
  const initialLength = mockShifts.length;
  mockShifts = mockShifts.filter((s) => s.id !== id);
  return mockShifts.length < initialLength;
};
