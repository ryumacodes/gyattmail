export const mails = [
  // Thread: Project Update (3 messages)
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    name: "Alice Smith",
    email: "ryuma@codes.com",
    subject: "Re: Project Update",
    text: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.\n\nI have a few minor suggestions that I'll include in the attached document.\n\nLet's discuss these during our next meeting. Keep up the excellent work!",
    date: "2023-10-22T10:30:00",
    read: true,
    labels: ["work", "important"],
    archived: false,
    deleted: false,
    starred: false,
    repliedTo: false,
    snoozeUntil: undefined,
    threadId: "thread-project-update",
    messageCount: 3,
    participants: [
      { name: "David Park", email: "david.park@example.com" },
      { name: "Alice Smith", email: "alice.smith@example.com" },
      { name: "Emily Rodriguez", email: "emily.r@example.com" },
      { name: "James Wilson", email: "james.w@example.com" },
    ],
    attachments: [
      { name: "Project_Suggestions.pdf", size: 245000, type: "application/pdf" },
      { name: "Timeline.xlsx", size: 89000, type: "application/vnd.ms-excel" },
      { name: "Budget_Breakdown.pdf", size: 156000, type: "application/pdf" },
    ],
  },

  // Single message: Group email (show avatar stack - 3 participants)
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "ryuma@codes.com",
    subject: "Meeting Tomorrow",
    text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
    date: "2023-10-22T09:00:00",
    read: false,
    labels: ["meeting", "work", "important"],
    archived: false,
    deleted: false,
    starred: true,
    repliedTo: false,
    snoozeUntil: undefined,
    messageCount: 1,
    participants: [
      { name: "William Smith", email: "william.smith@example.com" },
      { name: "Sarah Chen", email: "sarah.chen@example.com" },
      { name: "Marcus Johnson", email: "marcus.j@example.com" },
    ],
    attachments: [
      {
        name: "Project_Meeting.ics",
        size: 2048,
        type: "text/calendar",
        icsContent: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Company//My Product//EN
BEGIN:VEVENT
UID:project-meeting-2023@example.com
DTSTAMP:20231022T090000Z
DTSTART:20231023T140000Z
DTEND:20231023T150000Z
SUMMARY:Project Strategy Meeting
DESCRIPTION:Discussion of project timeline and resource allocation. Please review the attached documents before the meeting.
LOCATION:Conference Room A, Building 2
ORGANIZER;CN=William Smith:mailto:william.smith@example.com
ATTENDEE;CN=Sarah Chen;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:sarah.chen@example.com
ATTENDEE;CN=Marcus Johnson;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:marcus.j@example.com
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,
      },
    ],
  },

  // Single message: 1:1 email (NO avatar stack - 1 participant)
  {
    id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
    name: "Bob Johnson",
    email: "ryuma@codes.com",
    subject: "Weekend Plans",
    text: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun.\n\nIf you're interested, let me know, and we can plan the details. It'll be a great way to unwind and enjoy nature.\n\nLooking forward to your response!",
    date: "2023-10-20T11:45:00",
    read: false,
    labels: ["personal"],
    archived: false,
    deleted: false,
    starred: false,
    repliedTo: false,
    snoozeUntil: undefined,
    messageCount: 1,
    participants: [
      { name: "Bob Johnson", email: "bob.johnson@example.com" },
    ],
  },

  // Thread: Budget Discussion (2 messages)
  {
    id: "61c35085-72d7-42b4-8d62-738f700d4b92",
    name: "Emily Davis",
    email: "ryuma@icloud.com",
    subject: "Re: Question about Budget",
    text: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources.\n\nI've reviewed the budget report and identified a few areas where we might be able to optimize our spending without compromising the project's quality.\n\nI've attached a detailed analysis for your reference. Let's discuss this further in our next meeting.",
    date: "2023-10-19T09:00:00",
    read: false,
    labels: ["work", "budget"],
    archived: false,
    deleted: false,
    starred: false,
    repliedTo: false,
    snoozeUntil: undefined,
    threadId: "thread-budget",
    messageCount: 2,
    participants: [
      { name: "Emily Davis", email: "emily.davis@example.com" },
      { name: "Kevin Lee", email: "kevin.lee@example.com" },
      { name: "Nina Patel", email: "nina.patel@example.com" },
      { name: "Oscar Martinez", email: "oscar.m@example.com" },
      { name: "Sophia Turner", email: "sophia.t@example.com" },
    ],
    attachments: [
      { name: "Budget_Analysis_Q4.pdf", size: 1240000, type: "application/pdf" },
    ],
  },

  // Single message: 2 people (NO avatar stack - only 2 participants)
  {
    id: "8f7b5c3d-9e82-4c19-9a0a-3b0a08c8f8f8",
    name: "Michael Wilson",
    email: "ryuma@icloud.com",
    subject: "Important Announcement",
    text: "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch. We've received valuable feedback from our beta testers, and I believe it's time to make some adjustments to better meet our customers' needs.\n\nThis change is crucial to our success, and I look forward to discussing it with the team. Please make sure to attend the meeting.",
    date: "2023-10-18T15:00:00",
    read: false,
    labels: ["meeting", "work", "important"],
    archived: false,
    deleted: false,
    starred: false,
    repliedTo: false,
    snoozeUntil: undefined,
    messageCount: 1,
    participants: [
      { name: "Michael Wilson", email: "michael.wilson@example.com" },
      { name: "Jennifer Brooks", email: "jennifer.b@example.com" },
    ],
  },
]

// Explicit type with optional fields to allow runtime updates
export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
  archived: boolean
  deleted: boolean
  starred: boolean
  repliedTo?: boolean
  snoozeUntil?: string
  threadId?: string
  messageCount?: number
  participants?: Array<{ name: string; email: string }>
  attachments?: Array<{ name: string; size: number; type: string; icsContent?: string }>
}

// NOTE: Set accounts to empty array [] to test the first-run connect screen
// When accounts.length === 0, root page redirects to /connect
export const accounts = [
  {
    label: "Ryuma",
    email: "ryuma@codes.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Gmail</title>
        <path
          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
          fill="currentColor"
        />
      </svg>
    ),
    connectionStatus: "connected" as const,
  },
  {
    label: "Ryuma",
    email: "ryuma@icloud.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>iCloud</title>
        <path
          d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
          fill="currentColor"
        />
      </svg>
    ),
    connectionStatus: "connected" as const,
  },
]

export type Account = (typeof accounts)[number]

export const contacts = [
  {
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
  },
  {
    name: "Liam Wilson",
    email: "liam.wilson@example.com",
  },
  {
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
  },
  {
    name: "Noah Martinez",
    email: "noah.martinez@example.com",
  },
  {
    name: "Ava Taylor",
    email: "ava.taylor@example.com",
  },
  {
    name: "Lucas Brown",
    email: "lucas.brown@example.com",
  },
]

export type Contact = (typeof contacts)[number]
