export const projects = [
  {
    id: "p1",
    name: "Riverside Hotel",
    site: "Riverside Hotel Site",
    location: "Dehradun, Uttarakhand",
    description: "120-room hotel with banquet hall, landscaped grounds and service block.",
    startDate: "12 Jan 2026",
    targetDate: "28 Nov 2026",
    status: "In Progress",
    manager: "Priya Sharma",
    progress: 64,
    budget: "₹8.4 Cr",
    team: 86,
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    name: "Northstar Warehouse",
    site: "Sector 7 Industrial Park",
    location: "Gurugram, Haryana",
    description: "High-capacity logistics warehouse with loading bays and office wing.",
    startDate: "03 Mar 2026",
    targetDate: "30 Sep 2026",
    status: "Blocked",
    manager: "Arjun Mehta",
    progress: 38,
    budget: "₹4.1 Cr",
    team: 44,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    name: "Greenfield School",
    site: "Greenfield Education Campus",
    location: "Noida, Uttar Pradesh",
    description: "K-12 school campus including academic, sports and administration blocks.",
    startDate: "18 Aug 2025",
    targetDate: "15 Jul 2026",
    status: "In Progress",
    manager: "Priya Sharma",
    progress: 82,
    budget: "₹6.8 Cr",
    team: 62,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    name: "Orion Factory Expansion",
    site: "Orion Manufacturing Unit",
    location: "Pune, Maharashtra",
    description: "Addition of two production lines and upgraded utility infrastructure.",
    startDate: "22 Sep 2025",
    targetDate: "30 Apr 2026",
    status: "Completed",
    manager: "Arjun Mehta",
    progress: 100,
    budget: "₹3.2 Cr",
    team: 0,
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80",
  },
];

export const initialWorkOrders = [
  { id: "wo1", projectId: "p1", title: "Foundation & basement", description: "Complete excavation, PCC, footing and basement retaining walls.", contractor: "Apex Civil Works", createdBy: "Priya Sharma", priority: "Critical", dueDate: "18 Jun 2026", status: "In Progress", progress: 76, updated: "Today, 9:40 AM" },
  { id: "wo2", projectId: "p1", title: "Ground floor plumbing", description: "Install concealed water supply and drainage lines.", contractor: "Flowline Services", createdBy: "Priya Sharma", priority: "High", dueDate: "24 Jun 2026", status: "Blocked", progress: 42, updated: "Today, 8:15 AM" },
  { id: "wo3", projectId: "p1", title: "Electrical conduit", description: "Lay conduit and junction boxes across guest-room block.", contractor: "Spark Electricals", createdBy: "Priya Sharma", priority: "Medium", dueDate: "02 Jul 2026", status: "Not Started", progress: 0, updated: "Yesterday" },
  { id: "wo4", projectId: "p2", title: "Structural steel erection", description: "Erect primary frames for bays A through D.", contractor: "Metro Fabricators", createdBy: "Arjun Mehta", priority: "Critical", dueDate: "16 Jun 2026", status: "Blocked", progress: 38, updated: "Today, 10:20 AM" },
  { id: "wo5", projectId: "p2", title: "Storm-water drainage", description: "Install external drains and recharge pits.", contractor: "Apex Civil Works", createdBy: "Arjun Mehta", priority: "High", dueDate: "29 Jun 2026", status: "In Progress", progress: 55, updated: "Yesterday" },
  { id: "wo6", projectId: "p3", title: "Classroom painting", description: "Primer and two coats for academic blocks A and B.", contractor: "ColorCraft Co.", createdBy: "Priya Sharma", priority: "Medium", dueDate: "21 Jun 2026", status: "In Progress", progress: 68, updated: "Today, 11:05 AM" },
  { id: "wo7", projectId: "p3", title: "Fire alarm commissioning", description: "Test sensors, panels and evacuation alarms.", contractor: "Spark Electricals", createdBy: "Priya Sharma", priority: "High", dueDate: "30 Jun 2026", status: "Not Started", progress: 0, updated: "10 Jun 2026" },
  { id: "wo8", projectId: "p4", title: "Production floor finish", description: "Apply chemical-resistant epoxy flooring.", contractor: "Apex Civil Works", createdBy: "Arjun Mehta", priority: "High", dueDate: "14 Apr 2026", status: "Completed", progress: 100, updated: "14 Apr 2026" },
];

export const labour = [
  { id: 1, name: "Ramesh Kumar", phone: "98••• 4821", skill: "Mason", contractor: "Apex Civil Works", status: "Present" },
  { id: 2, name: "Imran Khan", phone: "97••• 1290", skill: "Welder", contractor: "Metro Fabricators", status: "Present" },
  { id: 3, name: "Sanjay Rawat", phone: "99••• 7554", skill: "Helper", contractor: "Apex Civil Works", status: "Half Day" },
  { id: 4, name: "Deepak Singh", phone: "96••• 3318", skill: "Electrician", contractor: "Spark Electricals", status: "Present" },
  { id: 5, name: "Mohan Lal", phone: "98••• 9042", skill: "Carpenter", contractor: "Apex Civil Works", status: "Absent" },
  { id: 6, name: "Salman Ali", phone: "97••• 6683", skill: "Plumber", contractor: "Flowline Services", status: "Present" },
  { id: 7, name: "Vijay Pal", phone: "99••• 2146", skill: "Painter", contractor: "ColorCraft Co.", status: "Present" },
];

export const materials = [
  { id: 1, date: "14 Jun", project: "Riverside Hotel", material: "Cement", quantity: "120 bags", type: "Issued", party: "Apex Civil Works", note: "Basement retaining wall" },
  { id: 2, date: "14 Jun", project: "Riverside Hotel", material: "PVC Pipes", quantity: "80 lengths", type: "Issued", party: "Flowline Services", note: "Ground floor plumbing" },
  { id: 3, date: "13 Jun", project: "Northstar Warehouse", material: "Structural Steel", quantity: "18.5 MT", type: "Received", party: "Tata Steel Supply", note: "Bay C and D frames" },
  { id: 4, date: "13 Jun", project: "Greenfield School", material: "Interior Paint", quantity: "240 litres", type: "Issued", party: "ColorCraft Co.", note: "Academic block B" },
  { id: 5, date: "12 Jun", project: "Riverside Hotel", material: "River Sand", quantity: "4 trucks", type: "Received", party: "Local supplier", note: "Weekly stock" },
  { id: 6, date: "11 Jun", project: "Northstar Warehouse", material: "Cement", quantity: "90 bags", type: "Issued", party: "Apex Civil Works", note: "External drainage" },
];

export const updates = [
  { id: 1, projectId: "p1", orderId: "wo1", author: "Vikram Joshi", initials: "VJ", time: "Today, 9:40 AM", text: "Basement retaining wall shuttering completed on the east side. Reinforcement inspection is scheduled after lunch.", progress: 76, photos: 4 },
  { id: 2, projectId: "p3", orderId: "wo6", author: "Neeraj Verma", initials: "NV", time: "Today, 11:05 AM", text: "Second coat completed in 12 classrooms. Corridor surface preparation is underway.", progress: 68, photos: 6 },
  { id: 3, projectId: "p2", orderId: "wo4", author: "Faizan Sheikh", initials: "FS", time: "Today, 10:20 AM", text: "Work paused: mobile crane permit is awaiting site safety approval.", progress: 38, photos: 2 },
];

export const comments = [
  { id: 1, author: "Priya Sharma", initials: "PS", time: "Yesterday, 4:32 PM", text: "Please confirm that the waterproofing inspection is included before backfilling.", mine: false },
  { id: 2, author: "Vikram Joshi", initials: "VJ", time: "Yesterday, 5:10 PM", text: "Confirmed. Inspection request has been submitted for tomorrow morning.", mine: true },
  { id: 3, author: "Priya Sharma", initials: "PS", time: "Today, 9:55 AM", text: "Great. Upload the signed checklist with today's update.", mine: false },
];

export const photos = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590644365607-1c5a38b7b2d2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=800&q=80",
];
