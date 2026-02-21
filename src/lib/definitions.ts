export const complaintCategories = [
  'Medical',
  'Security',
  'Cleanliness',
  'Food',
  'Delay',
  'Staff Behavior',
  'Infrastructure',
  'Other',
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number];

export const journeyDetailsOptions = [
  'PNR',
  'Ticket No',
  'Train No',
  'Station Name',
] as const;

export type JourneyDetailOption = (typeof journeyDetailsOptions)[number];

export const complaintStatuses = [
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
] as const;

export type ComplaintStatus = (typeof complaintStatuses)[number];

export type Complaint = {
  id: string;
  category: ComplaintCategory;
  date: string;
  status: ComplaintStatus;
  description: string;
  pnr?: string;
  ticketNo?: string;
  trainNo?: string;
  stationName?: string;
  submittedBy: string;
  history: {
    status: ComplaintStatus;
    timestamp: string;
    remarks?: string;
  }[];
  aiSuggestedCategory?: ComplaintCategory;
  aiPriority?: number;
  aiReason?: string;
};
