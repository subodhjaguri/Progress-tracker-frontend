import React, { useMemo, useState } from "react";
import {
  LayoutDashboard, FolderKanban, ClipboardList, Users, Boxes, ChartNoAxesCombined,
  Search, Bell, Plus, Menu, X, ChevronDown, MapPin, CalendarDays, HardHat,
  CircleCheckBig, CircleAlert, Clock3, BriefcaseBusiness, UserRoundCheck,
  PackageCheck, TrendingUp, MoreHorizontal, ArrowLeft, Camera, FileText,
  MessageSquareText, ListChecks, Send, Upload, Phone, SlidersHorizontal,
  Building2, UsersRound, ClipboardCheck, SunMedium, CloudSun, Download,
} from "lucide-react";
import {
  projects as seedProjects, initialWorkOrders, labour, materials, updates as seedUpdates,
  comments as seedComments, photos,
} from "./data";
import {
  StatusPill, ProgressBar, StatCard, Section, TextAction, Modal, Field, UpdateItem,
} from "./components";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: Users },
  { id: "materials", label: "Materials", icon: Boxes },
  { id: "reports", label: "Daily Report", icon: ChartNoAxesCombined },
];

const roles = {
  "Super Admin": { name: "Subodh Jaguri", initials: "SJ", caption: "Business owner" },
  Manager: { name: "Priya Sharma", initials: "PS", caption: "Project manager" },
  Contractor: { name: "Vikram Joshi", initials: "VJ", caption: "Apex Civil Works" },
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState("Super Admin");
  const [projects, setProjects] = useState(seedProjects);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [attendance, setAttendance] = useState(labour);
  const [updates, setUpdates] = useState(seedUpdates);
  const [comments, setComments] = useState(seedComments);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modal, setModal] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (nextPage) => {
    setPage(nextPage);
    setSelectedProject(null);
    setSelectedOrder(null);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setSelectedOrder(null);
    setPage("projects");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setSelectedProject(projects.find((project) => project.id === order.projectId));
    setPage("work-orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleProjects = role === "Manager"
    ? projects.filter((project) => project.manager === "Priya Sharma")
    : projects;
  const visibleOrders = role === "Contractor"
    ? workOrders.filter((order) => order.contractor === "Apex Civil Works")
    : workOrders;

  const renderPage = () => {
    if (page === "projects" && selectedProject) {
      return <ProjectDetail project={selectedProject} orders={workOrders.filter((item) => item.projectId === selectedProject.id)} updates={updates.filter((item) => item.projectId === selectedProject.id)} onBack={() => setSelectedProject(null)} onOrder={openOrder} onReport={() => setPage("reports")} />;
    }
    if (page === "work-orders" && selectedOrder) {
      return <WorkOrderDetail order={selectedOrder} project={selectedProject} updates={updates.filter((item) => item.orderId === selectedOrder.id)} comments={comments} setComments={setComments} onBack={() => setSelectedOrder(null)} onUpdate={() => setModal("progress")} announce={announce} />;
    }
    if (page === "dashboard") return <Dashboard role={role} projects={visibleProjects} orders={visibleOrders} updates={updates} attendance={attendance} onNavigate={navigate} onProject={openProject} onOrder={openOrder} onModal={setModal} />;
    if (page === "projects") return <ProjectsPage projects={visibleProjects} onProject={openProject} onCreate={() => setModal("project")} />;
    if (page === "work-orders") return <WorkOrdersPage orders={visibleOrders} projects={projects} onOrder={openOrder} onCreate={() => setModal("work-order")} />;
    if (page === "attendance") return <AttendancePage attendance={attendance} setAttendance={setAttendance} role={role} announce={announce} />;
    if (page === "materials") return <MaterialsPage materials={materials} onIssue={() => setModal("material")} />;
    return <DailyReport projects={projects} workOrders={workOrders} attendance={attendance} materials={materials} updates={updates} />;
  };

  return (
    <div className="app-shell">
      <Sidebar role={role} page={page} onNavigate={navigate} open={mobileNav} onClose={() => setMobileNav(false)} />
      <div className="main-shell">
        <Topbar role={role} setRole={setRole} search={search} setSearch={setSearch} onMenu={() => setMobileNav(true)} announce={announce} />
        <main className="page-content">{renderPage()}</main>
      </div>
      {modal === "project" && <ProjectForm onClose={() => setModal(null)} onSave={(project) => { setProjects((current) => [project, ...current]); setModal(null); announce("Project created successfully"); }} />}
      {modal === "work-order" && <WorkOrderForm projects={projects} onClose={() => setModal(null)} onSave={(order) => { setWorkOrders((current) => [order, ...current]); setModal(null); announce("Work order created and assigned"); }} />}
      {modal === "progress" && <ProgressForm order={selectedOrder} onClose={() => setModal(null)} onSave={(update) => { setUpdates((current) => [update, ...current]); setWorkOrders((current) => current.map((item) => item.id === selectedOrder.id ? { ...item, progress: update.progress, status: update.status, updated: "Just now" } : item)); setSelectedOrder((current) => ({ ...current, progress: update.progress, status: update.status, updated: "Just now" })); setModal(null); announce("Progress update posted"); }} />}
      {modal === "material" && <MaterialForm onClose={() => setModal(null)} onSave={() => { setModal(null); announce("Material issue recorded"); }} />}
      {toast && <div className="toast"><CircleCheckBig size={18} />{toast}</div>}
    </div>
  );
}

function Sidebar({ role, page, onNavigate, open, onClose }) {
  return (
    <>
      {open && <div className="nav-scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><HardHat size={25} /></div>
          <div><strong>Progress</strong><span>TRACKER</span></div>
          <button className="nav-close" onClick={onClose}><X size={21} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => onNavigate(id)}>
              <Icon size={20} /><span>{label}</span>
              {id === "work-orders" && <i>8</i>}
            </button>
          ))}
        </nav>
        <div className="site-card">
          <span>ACTIVE SITE</span>
          <strong>Riverside Hotel</strong>
          <small>64% overall progress</small>
          <div><i style={{ width: "64%" }} /></div>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{roles[role].initials}</div>
          <div><strong>{roles[role].name}</strong><span>{role}</span></div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
    </>
  );
}

function Topbar({ role, setRole, search, setSearch, onMenu, announce }) {
  const [roleOpen, setRoleOpen] = useState(false);
  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu}><Menu size={23} /></button>
      <div className="global-search"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, work orders, people..." /></div>
      <div className="topbar-actions">
        <button className="icon-button notification" onClick={() => announce("You're all caught up")}><Bell size={20} /><i /></button>
        <div className="role-switcher">
          <button onClick={() => setRoleOpen(!roleOpen)}>
            <div className="avatar small">{roles[role].initials}</div>
            <span><small>Viewing as</small><strong>{role}</strong></span>
            <ChevronDown size={16} />
          </button>
          {roleOpen && <div className="role-menu">
            {Object.keys(roles).map((item) => <button key={item} className={role === item ? "selected" : ""} onClick={() => { setRole(item); setRoleOpen(false); }}>{item}<span>{roles[item].caption}</span></button>)}
          </div>}
        </div>
      </div>
    </header>
  );
}

function PageHeading({ eyebrow, title, text, action, secondary }) {
  return (
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>
      <div className="heading-actions">{secondary}{action}</div>
    </div>
  );
}

function Dashboard({ role, projects, orders, updates, attendance, onNavigate, onProject, onOrder, onModal }) {
  const present = attendance.filter((item) => item.status === "Present").length;
  const dashboardStats = role === "Contractor"
    ? [
      ["Assigned Work Orders", orders.length, ClipboardList, "green"],
      ["Completed", orders.filter((o) => o.status === "Completed").length, CircleCheckBig, "blue"],
      ["Pending", orders.filter((o) => o.status !== "Completed").length, Clock3, "amber"],
      ["Labour Count", attendance.length, HardHat, "violet"],
    ]
    : role === "Manager"
      ? [
        ["My Projects", projects.length, Building2, "green"],
        ["Active Work Orders", orders.filter((o) => o.status === "In Progress").length, ClipboardList, "blue"],
        ["Completed", orders.filter((o) => o.status === "Completed").length, CircleCheckBig, "violet"],
        ["Blocked", orders.filter((o) => o.status === "Blocked").length, CircleAlert, "red"],
      ]
      : [
        ["Total Projects", projects.length, Building2, "green"],
        ["Active Projects", projects.filter((p) => p.status === "In Progress").length, TrendingUp, "blue"],
        ["Managers", 4, BriefcaseBusiness, "violet"],
        ["Total Workforce", 192, HardHat, "amber"],
      ];
  return (
    <>
      <PageHeading eyebrow="SUNDAY, 14 JUNE 2026" title={`Good afternoon, ${roles[role].name.split(" ")[0]}`} text="Here is what's happening across your sites today." action={<button className="primary-button" onClick={() => role === "Contractor" ? onNavigate("work-orders") : onModal("project")}><Plus size={18} />{role === "Contractor" ? "View assigned work" : "New project"}</button>} />
      <div className="stats-grid">
        {dashboardStats.map(([label, value, icon, tone]) => <StatCard key={label} label={label} value={value} icon={icon} tone={tone} note={label === "Active Projects" ? "2 on schedule" : undefined} />)}
      </div>
      <div className="dashboard-grid">
        <Section title="Project progress" eyebrow="PORTFOLIO" action={<TextAction onClick={() => onNavigate("projects")}>View all</TextAction>} className="project-progress-panel">
          <div className="dashboard-projects">
            {projects.slice(0, 3).map((project) => (
              <button key={project.id} className="dashboard-project-row" onClick={() => onProject(project)}>
                <img src={project.image} alt="" />
                <div className="dashboard-project-main"><strong>{project.name}</strong><span><MapPin size={13} />{project.location}</span><ProgressBar value={project.progress} compact /></div>
                <StatusPill value={project.status} />
              </button>
            ))}
          </div>
        </Section>
        <Section title="Today's attendance" eyebrow="WORKFORCE" action={<TextAction onClick={() => onNavigate("attendance")}>Manage</TextAction>}>
          <div className="attendance-ring-wrap">
            <div className="attendance-ring" style={{ "--attendance": `${Math.round((present / attendance.length) * 100) * 3.6}deg` }}><div><strong>{Math.round((present / attendance.length) * 100)}%</strong><span>Present</span></div></div>
            <div className="attendance-legend">
              <div><i className="present" /><span>Present</span><strong>{present}</strong></div>
              <div><i className="absent" /><span>Absent</span><strong>{attendance.filter((item) => item.status === "Absent").length}</strong></div>
              <div><i className="half" /><span>Half day</span><strong>{attendance.filter((item) => item.status === "Half Day").length}</strong></div>
            </div>
          </div>
          <div className="attendance-callout"><SunMedium size={19} /><span><strong>Attendance is up today</strong>6% higher than last Sunday</span></div>
        </Section>
        <Section title="Recent site updates" eyebrow="LIVE FROM THE FIELD" action={<TextAction onClick={() => onNavigate("reports")}>Daily report</TextAction>} className="updates-panel">
          <div className="updates-list">
            {updates.slice(0, 3).map((update) => <UpdateItem key={update.id} update={update} orderTitle={orders.find((item) => item.id === update.orderId)?.title || "Work order"} onOpen={() => { const order = orders.find((item) => item.id === update.orderId); if (order) onOrder(order); }} />)}
          </div>
        </Section>
        <Section title="Needs attention" eyebrow="BLOCKERS & DUE DATES">
          <div className="attention-list">
            {orders.filter((item) => item.status === "Blocked" || item.priority === "Critical").slice(0, 3).map((order) => (
              <button key={order.id} onClick={() => onOrder(order)}>
                <span className={order.status === "Blocked" ? "danger-dot" : "warning-dot"}><CircleAlert size={18} /></span>
                <div><strong>{order.title}</strong><span>{order.status === "Blocked" ? "Blocked" : `Due ${order.dueDate}`} · {order.contractor}</span></div>
                <ChevronDown size={17} />
              </button>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function ProjectsPage({ projects, onProject, onCreate }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? projects : projects.filter((project) => project.status === filter);
  return (
    <>
      <PageHeading eyebrow="PROJECTS" title="Every site, one clear view" text="Track schedules, teams, work and field activity across your portfolio." action={<button className="primary-button" onClick={onCreate}><Plus size={18} />Create project</button>} />
      <div className="toolbar">
        <div className="filter-tabs">{["All", "In Progress", "Blocked", "Completed"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <button className="secondary-button"><SlidersHorizontal size={17} />More filters</button>
      </div>
      <div className="project-card-grid">
        {shown.map((project) => (
          <article className="project-card" key={project.id} onClick={() => onProject(project)}>
            <div className="project-image"><img src={project.image} alt={project.name} /><StatusPill value={project.status} /><button><MoreHorizontal size={19} /></button></div>
            <div className="project-card-body">
              <span className="project-code">PRJ-{project.id.slice(1).padStart(3, "0")}</span>
              <h2>{project.name}</h2>
              <p><MapPin size={15} />{project.location}</p>
              <ProgressBar value={project.progress} />
              <div className="project-card-meta"><span><CalendarDays size={15} />Due {project.targetDate}</span><span><UsersRound size={15} />{project.team} on site</span></div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ProjectDetail({ project, orders, updates, onBack, onOrder, onReport }) {
  const [tab, setTab] = useState("Overview");
  return (
    <>
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} />All projects</button>
      <div className="project-hero">
        <img src={project.image} alt="" />
        <div className="project-hero-overlay" />
        <div className="project-hero-content">
          <span>PRJ-{project.id.slice(1).padStart(3, "0")}</span>
          <div><h1>{project.name}</h1><StatusPill value={project.status} /></div>
          <p><MapPin size={16} />{project.site} · {project.location}</p>
        </div>
        <button className="light-button" onClick={onReport}><ChartNoAxesCombined size={18} />View daily report</button>
      </div>
      <div className="project-summary-grid">
        <div><span>Overall progress</span><strong>{project.progress}%</strong><div className="summary-progress"><i style={{ width: `${project.progress}%` }} /></div></div>
        <div><span>Target completion</span><strong>{project.targetDate}</strong><small>On schedule</small></div>
        <div><span>Project manager</span><strong>{project.manager}</strong><small>4 active work orders</small></div>
        <div><span>Workforce today</span><strong>{project.team}</strong><small>92% attendance</small></div>
      </div>
      <div className="detail-tabs">{["Overview", "Work Orders", "Updates", "Photos", "Documents", "Comments"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}{item === "Work Orders" && <i>{orders.length}</i>}</button>)}</div>
      {tab === "Overview" && <div className="detail-grid">
        <Section title="Work orders" action={<button className="small-button"><Plus size={15} />Add work order</button>}>
          <div className="order-list compact-list">{orders.map((order) => <OrderRow key={order.id} order={order} onClick={() => onOrder(order)} />)}</div>
        </Section>
        <Section title="Site snapshot">
          <div className="snapshot-grid"><div><HardHat /><strong>{project.team}</strong><span>People on site</span></div><div><PackageCheck /><strong>2</strong><span>Issues today</span></div><div><Camera /><strong>12</strong><span>Photos today</span></div><div><CircleAlert /><strong>{orders.filter((o) => o.status === "Blocked").length}</strong><span>Blockers</span></div></div>
        </Section>
        <Section title="Latest updates" className="wide-panel"><div className="updates-list">{updates.map((update) => <UpdateItem key={update.id} update={update} orderTitle={orders.find((item) => item.id === update.orderId)?.title} />)}</div></Section>
      </div>}
      {tab === "Work Orders" && <Section title={`${orders.length} work orders`}><div className="order-list">{orders.map((order) => <OrderRow key={order.id} order={order} onClick={() => onOrder(order)} />)}</div></Section>}
      {tab === "Updates" && <Section title="Progress timeline"><div className="updates-list">{updates.map((update) => <UpdateItem key={update.id} update={update} orderTitle={orders.find((item) => item.id === update.orderId)?.title} />)}</div></Section>}
      {tab === "Photos" && <MediaGallery />}
      {tab === "Documents" && <DocumentsList />}
      {tab === "Comments" && <Section title="Project discussion"><div className="empty-inline"><MessageSquareText /><strong>No project-level comments yet</strong><p>Start a discussion with the site team.</p><button className="primary-button">Add comment</button></div></Section>}
    </>
  );
}

function OrderRow({ order, onClick }) {
  return (
    <button className="order-row" onClick={onClick}>
      <div className={`priority-stripe ${order.priority.toLowerCase()}`} />
      <div className="order-name"><span>WO-{order.id.slice(2).padStart(3, "0")}</span><strong>{order.title}</strong><small>{order.contractor}</small></div>
      <StatusPill value={order.status} />
      <div className="row-progress"><span>{order.progress}%</span><div><i style={{ width: `${order.progress}%` }} /></div></div>
      <span className="due-date"><CalendarDays size={14} />{order.dueDate}</span>
      <ChevronDown size={17} />
    </button>
  );
}

function WorkOrdersPage({ orders, projects, onOrder, onCreate }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? orders : orders.filter((order) => order.status === filter);
  return (
    <>
      <PageHeading eyebrow="WORK ORDERS" title="Work that moves the site forward" text="Assign responsibilities, track progress and resolve blockers." action={<button className="primary-button" onClick={onCreate}><Plus size={18} />New work order</button>} />
      <div className="toolbar">
        <div className="filter-tabs">{["All", "Not Started", "In Progress", "Blocked", "Completed"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? orders.length : orders.filter((order) => order.status === item).length}</span></button>)}</div>
        <button className="secondary-button"><SlidersHorizontal size={17} />Filters</button>
      </div>
      <Section title={`${shown.length} work orders`} className="table-panel">
        <div className="orders-table-header"><span>Work order</span><span>Project</span><span>Status</span><span>Progress</span><span>Due date</span><span /></div>
        <div className="order-list">
          {shown.map((order) => <button className="order-table-row" key={order.id} onClick={() => onOrder(order)}>
            <div className="order-title-cell"><i className={`priority-dot ${order.priority.toLowerCase()}`} /><span><strong>{order.title}</strong><small>{order.contractor} · {order.priority}</small></span></div>
            <span>{projects.find((project) => project.id === order.projectId)?.name}</span><StatusPill value={order.status} />
            <div className="row-progress"><span>{order.progress}%</span><div><i style={{ width: `${order.progress}%` }} /></div></div>
            <span>{order.dueDate}</span><ChevronDown size={17} />
          </button>)}
        </div>
      </Section>
    </>
  );
}

function WorkOrderDetail({ order, project, updates, comments, setComments, onBack, onUpdate, announce }) {
  const [tab, setTab] = useState("Updates");
  const [message, setMessage] = useState("");
  const addComment = () => {
    if (!message.trim()) return;
    setComments((current) => [...current, { id: Date.now(), author: "Vikram Joshi", initials: "VJ", time: "Just now", text: message, mine: true }]);
    setMessage("");
  };
  return (
    <>
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} />All work orders</button>
      <div className="work-order-heading">
        <div><span className="eyebrow">{project?.name} · WO-{order.id.slice(2).padStart(3, "0")}</span><div><h1>{order.title}</h1><StatusPill value={order.status} /></div><p>{order.description}</p></div>
        <button className="primary-button" onClick={onUpdate}><TrendingUp size={18} />Update progress</button>
      </div>
      <div className="order-overview">
        <div><span>Contractor</span><strong>{order.contractor}</strong><small>Assigned owner</small></div>
        <div><span>Priority</span><strong className={`priority-text ${order.priority.toLowerCase()}`}>{order.priority}</strong><small>Set by {order.createdBy}</small></div>
        <div><span>Due date</span><strong>{order.dueDate}</strong><small>8 days remaining</small></div>
        <div className="progress-overview"><span>Progress</span><strong>{order.progress}%</strong><div><i style={{ width: `${order.progress}%` }} /></div><small>Updated {order.updated}</small></div>
      </div>
      <div className="detail-tabs">{["Updates", "Labour Tasks", "Photos", "Documents", "Comments"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}{item === "Comments" && <i>{comments.length}</i>}</button>)}</div>
      {tab === "Updates" && <div className="detail-grid">
        <Section title="Progress updates" action={<button className="small-button" onClick={onUpdate}><Plus size={15} />Post update</button>} className="wide-panel"><div className="updates-list">{updates.map((update) => <UpdateItem key={update.id} update={update} orderTitle={order.title} />)}{updates.length === 0 && <div className="empty-inline"><TrendingUp /><strong>No updates yet</strong><p>Post the first update from the field.</p></div>}</div></Section>
        <Section title="Work checklist"><div className="task-checklist">{["Excavation and dressing", "PCC below footings", "Footing reinforcement", "Retaining wall shuttering", "Waterproofing inspection", "Backfilling"].map((task, index) => <label key={task}><input type="checkbox" defaultChecked={index < 4} /><span>{task}</span></label>)}</div><button className="text-action" onClick={() => announce("Checklist changes saved")}>Save checklist</button></Section>
      </div>}
      {tab === "Labour Tasks" && <Section title="Labour tasks" action={<button className="small-button"><Plus size={15} />Add task</button>}><div className="labour-tasks">{["Complete east wall shuttering", "Tie retaining wall reinforcement", "Clear excavation access path"].map((task, index) => <article key={task}><div className={index === 2 ? "task-icon pending" : "task-icon"}>{index === 2 ? <Clock3 /> : <ClipboardCheck />}</div><div><strong>{task}</strong><span>{index === 2 ? "6 helpers · In progress" : "8 masons · Completed today"}</span></div><StatusPill value={index === 2 ? "In Progress" : "Completed"} /></article>)}</div></Section>}
      {tab === "Photos" && <MediaGallery />}
      {tab === "Documents" && <DocumentsList />}
      {tab === "Comments" && <Section title="Site discussion" className="comments-panel"><div className="comments-list">{comments.map((comment) => <div className={`comment ${comment.mine ? "mine" : ""}`} key={comment.id}><div className="avatar">{comment.initials}</div><div><span>{comment.author} · {comment.time}</span><p>{comment.text}</p></div></div>)}</div><div className="comment-composer"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addComment()} placeholder="Write a comment..." /><button onClick={addComment}><Send size={18} /></button></div></Section>}
    </>
  );
}

function AttendancePage({ attendance, setAttendance, role, announce }) {
  const counts = useMemo(() => ({
    Present: attendance.filter((item) => item.status === "Present").length,
    Absent: attendance.filter((item) => item.status === "Absent").length,
    "Half Day": attendance.filter((item) => item.status === "Half Day").length,
  }), [attendance]);
  const updateStatus = (id, status) => setAttendance((current) => current.map((person) => person.id === id ? { ...person, status } : person));
  return (
    <>
      <PageHeading eyebrow="ATTENDANCE" title="Who's on site today" text="Sunday, 14 June 2026 · Riverside Hotel Site" action={<button className="primary-button" onClick={() => announce("Today's attendance saved")}><CircleCheckBig size={18} />Save attendance</button>} secondary={<button className="secondary-button"><CalendarDays size={17} />Change date</button>} />
      <div className="stats-grid attendance-stats">
        <StatCard label="Total labour" value={attendance.length} icon={HardHat} tone="green" />
        <StatCard label="Present" value={counts.Present} icon={UserRoundCheck} tone="blue" />
        <StatCard label="Absent" value={counts.Absent} icon={X} tone="red" />
        <StatCard label="Half day" value={counts["Half Day"]} icon={Clock3} tone="amber" />
      </div>
      <Section title="Daily attendance" eyebrow={role === "Contractor" ? "YOUR WORKFORCE" : "ALL CONTRACTORS"} action={<button className="small-button"><Plus size={15} />Add labour</button>} className="attendance-panel">
        <div className="attendance-table-header"><span>Labour</span><span>Skill</span><span>Contractor</span><span>Attendance</span></div>
        <div className="attendance-table">
          {attendance.map((person) => <div className="attendance-person" key={person.id}><div className="person-cell"><div className="avatar">{person.name.split(" ").map((n) => n[0]).join("")}</div><span><strong>{person.name}</strong><small><Phone size={12} />{person.phone}</small></span></div><span>{person.skill}</span><span>{person.contractor}</span><div className="attendance-selector">{["Present", "Absent", "Half Day"].map((status) => <button key={status} className={person.status === status ? status.toLowerCase().replace(" ", "-") : ""} onClick={() => updateStatus(person.id, status)}>{status}</button>)}</div></div>)}
        </div>
      </Section>
    </>
  );
}

function MaterialsPage({ materials, onIssue }) {
  return (
    <>
      <PageHeading eyebrow="MATERIALS" title="Know what came in and went out" text="A chronological material ledger across every active site." action={<button className="primary-button" onClick={onIssue}><Plus size={18} />Record movement</button>} />
      <div className="stats-grid material-stats">
        <StatCard label="Issued today" value="200 units" icon={PackageCheck} tone="amber" note="Across 2 sites" />
        <StatCard label="Received this week" value="28.5 MT" icon={Boxes} tone="green" note="5 deliveries" />
        <StatCard label="Active suppliers" value="12" icon={BriefcaseBusiness} tone="blue" />
        <StatCard label="Low stock items" value="3" icon={CircleAlert} tone="red" note="Needs attention" />
      </div>
      <Section title="Material ledger" eyebrow="LATEST MOVEMENTS" action={<div className="inline-actions"><button className="secondary-button"><SlidersHorizontal size={16} />Filter</button><button className="secondary-button"><Download size={16} />Export</button></div>} className="ledger-panel">
        <div className="ledger-header"><span>Date</span><span>Material</span><span>Project</span><span>Movement</span><span>Issued to / Supplier</span></div>
        <div className="ledger-list">{materials.map((item) => <article key={item.id}><span>{item.date}<small>2026</small></span><div><strong>{item.material}</strong><small>{item.note}</small></div><span>{item.project}</span><div><StatusPill value={item.type} /><strong>{item.quantity}</strong></div><span>{item.party}</span></article>)}</div>
      </Section>
    </>
  );
}

function DailyReport({ projects, workOrders, attendance, materials, updates }) {
  const [projectId, setProjectId] = useState("p1");
  const project = projects.find((item) => item.id === projectId);
  const orders = workOrders.filter((item) => item.projectId === projectId);
  return (
    <>
      <PageHeading eyebrow="DAILY SITE REPORT" title="The full site story, at a glance" text="A concise view of workforce, progress, materials and important events." action={<button className="primary-button"><Download size={18} />Download report</button>} />
      <div className="report-controls"><Field label="Project"><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Report date"><input type="date" defaultValue="2026-06-14" /></Field></div>
      <section className="report-sheet">
        <header className="report-cover">
          <div><span>DAILY SITE REPORT</span><h1>{project.name}</h1><p><MapPin size={15} />{project.site}, {project.location}</p></div>
          <div className="weather"><CloudSun size={32} /><strong>31°C</strong><span>Partly cloudy</span></div>
          <div className="report-date"><span>Sunday</span><strong>14</strong><small>June 2026</small></div>
        </header>
        <div className="report-metrics"><div><HardHat /><span><strong>{attendance.filter((item) => item.status === "Present").length}</strong>Present today</span></div><div><ClipboardCheck /><span><strong>{orders.filter((item) => item.status === "In Progress").length}</strong>Work orders active</span></div><div><PackageCheck /><span><strong>{materials.filter((item) => item.date === "14 Jun").length}</strong>Material issues</span></div><div><Camera /><span><strong>{updates.filter((item) => item.projectId === projectId).reduce((sum, item) => sum + item.photos, 0)}</strong>Photos uploaded</span></div></div>
        <div className="report-body">
          <div className="report-column">
            <h2>Work progress</h2>
            {orders.map((order) => <div className="report-order" key={order.id}><div><strong>{order.title}</strong><StatusPill value={order.status} /></div><ProgressBar value={order.progress} compact /><small>{order.contractor}</small></div>)}
          </div>
          <div className="report-column">
            <h2>Major updates & remarks</h2>
            {updates.filter((item) => item.projectId === projectId).map((update) => <article className="report-update" key={update.id}><div className="avatar">{update.initials}</div><div><strong>{update.text}</strong><span>{update.author} · {update.time}</span></div></article>)}
            <h2 className="report-subheading">Materials issued today</h2>
            {materials.filter((item) => item.date === "14 Jun" && item.project === project.name).map((item) => <div className="report-material" key={item.id}><PackageCheck /><span><strong>{item.quantity} {item.material}</strong><small>Issued to {item.party}</small></span></div>)}
          </div>
        </div>
        <div className="report-gallery">{photos.slice(0, 3).map((photo, index) => <div key={photo}><img src={photo} alt={`Site update ${index + 1}`} />{index === 2 && <span>+9 more</span>}</div>)}</div>
      </section>
    </>
  );
}

function MediaGallery() {
  return <Section title="Site photos" action={<button className="small-button"><Upload size={15} />Upload photos</button>}><div className="media-gallery">{photos.map((photo, index) => <figure key={photo}><img src={photo} alt={`Construction progress ${index + 1}`} /><figcaption><strong>{["East retaining wall", "Reinforcement inspection", "Basement shuttering", "Excavation access"][index]}</strong><span>Uploaded today</span></figcaption></figure>)}</div></Section>;
}

function DocumentsList() {
  return <Section title="Documents" action={<button className="small-button"><Upload size={15} />Upload document</button>}><div className="documents-list">{["Waterproofing inspection checklist.pdf", "Basement reinforcement drawing.pdf", "Concrete pour schedule.xlsx"].map((name, index) => <article key={name}><div className={`document-icon ${index === 2 ? "excel" : ""}`}><FileText /></div><div><strong>{name}</strong><span>{index === 2 ? "148 KB" : "2.4 MB"} · Updated {index === 0 ? "today" : "12 Jun 2026"}</span></div><button className="icon-button"><Download size={18} /></button></article>)}</div></Section>;
}

function ProjectForm({ onClose, onSave }) {
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ id: `p${Date.now()}`, name: form.get("name"), site: form.get("site"), location: form.get("location"), description: form.get("description"), startDate: "14 Jun 2026", targetDate: form.get("target"), status: "Planning", manager: form.get("manager"), progress: 0, budget: "Not set", team: 0, image: photos[0] });
  };
  return <Modal title="Create a new project" subtitle="Set up the site basics. You can add work orders next." onClose={onClose} wide><form className="form-grid" onSubmit={submit}><Field label="Project name"><input name="name" required placeholder="e.g. Lakeview Apartments" /></Field><Field label="Site name"><input name="site" required placeholder="Site or campus name" /></Field><Field label="Site location" className="full"><input name="location" required placeholder="City, State" /></Field><Field label="Description" className="full"><textarea name="description" rows="3" placeholder="A short description of the project" /></Field><Field label="Target completion"><input name="target" type="date" required /></Field><Field label="Manager"><select name="manager"><option>Priya Sharma</option><option>Arjun Mehta</option></select></Field><FormActions onClose={onClose} label="Create project" /></form></Modal>;
}

function WorkOrderForm({ projects, onClose, onSave }) {
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ id: `wo${Date.now()}`, projectId: form.get("project"), title: form.get("title"), description: form.get("description"), contractor: form.get("contractor"), createdBy: "Priya Sharma", priority: form.get("priority"), dueDate: form.get("due"), status: "Not Started", progress: 0, updated: "Just now" });
  };
  return <Modal title="Create work order" subtitle="Define the work and assign the execution owner." onClose={onClose} wide><form className="form-grid" onSubmit={submit}><Field label="Work order title" className="full"><input name="title" required placeholder="e.g. First floor brickwork" /></Field><Field label="Project"><select name="project">{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></Field><Field label="Contractor"><select name="contractor"><option>Apex Civil Works</option><option>Flowline Services</option><option>Spark Electricals</option><option>Metro Fabricators</option></select></Field><Field label="Description" className="full"><textarea name="description" rows="3" placeholder="Describe the expected work and outcome" /></Field><Field label="Priority"><select name="priority"><option>Medium</option><option>Low</option><option>High</option><option>Critical</option></select></Field><Field label="Due date"><input name="due" type="date" required /></Field><FormActions onClose={onClose} label="Create & assign" /></form></Modal>;
}

function ProgressForm({ order, onClose, onSave }) {
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ id: Date.now(), projectId: order.projectId, orderId: order.id, author: "Vikram Joshi", initials: "VJ", time: "Just now", text: form.get("notes"), progress: Number(form.get("progress")), photos: 3, status: form.get("status") });
  };
  return <Modal title="Post progress update" subtitle={order.title} onClose={onClose}><form className="form-grid single" onSubmit={submit}><Field label="Progress percentage"><div className="range-field"><input name="progress" type="range" min="0" max="100" defaultValue={order.progress} onInput={(event) => event.currentTarget.nextElementSibling.textContent = `${event.currentTarget.value}%`} /><strong>{order.progress}%</strong></div></Field><Field label="Current status"><select name="status" defaultValue={order.status}><option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Completed</option></select></Field><Field label="What happened today?"><textarea name="notes" rows="4" required placeholder="Keep it clear and specific for the project owner..." /></Field><button type="button" className="upload-zone"><Upload size={24} /><strong>Add photos or documents</strong><span>Prototype only · files are not stored</span></button><FormActions onClose={onClose} label="Post update" /></form></Modal>;
}

function MaterialForm({ onClose, onSave }) {
  return <Modal title="Record material movement" subtitle="Add a receipt or issue to the project ledger." onClose={onClose}><form className="form-grid single" onSubmit={(e) => { e.preventDefault(); onSave(); }}><Field label="Movement"><select><option>Material issued</option><option>Material received</option></select></Field><Field label="Material name"><input required placeholder="e.g. Cement" /></Field><Field label="Quantity"><input required placeholder="e.g. 50 bags" /></Field><Field label="Issued to / Supplier"><input required placeholder="Contractor or supplier name" /></Field><Field label="Notes"><textarea rows="3" placeholder="Purpose or work order" /></Field><FormActions onClose={onClose} label="Save movement" /></form></Modal>;
}

function FormActions({ onClose, label }) {
  return <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{label}</button></div>;
}

export default App;
