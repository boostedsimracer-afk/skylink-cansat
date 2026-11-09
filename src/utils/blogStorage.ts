export interface BlogPost {
  id: string;
  title: string;
  category: 'workshop' | 'presentation' | 'engineering' | 'outreach';
  date: string;
  sessionNumber?: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  summary: string;
  author: string;
  authorRole: string;
  tags: string[];
  trainerOrLocation?: string;
  fullReport: {
    objectives: string[];
    completedMilestones: string[];
    technicalDetails: { label: string; value: string }[];
    quote?: string;
    nextSteps: string;
  };
}

const BLOG_KEY = 'skylink_team_blog_posts_v3';

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 'induction-session-oct25',
    sessionNumber: 'Session 0',
    title: 'Induction Session & Team SKYLINK Formation',
    category: 'workshop',
    date: 'Sun, 25 October 2026',
    status: 'completed',
    trainerOrLocation: 'Reem Senan & Muneera Almalki (BSA) • AUBH Auditorium',
    author: 'Zaid Ahmad Khan',
    authorRole: 'Science & Outreach Lead',
    tags: ['Induction', 'Team Formation', 'Selection', 'Outreach'],
    summary:
      'Team SKYLINK attended the official CanSat Bahrain Competition 2026 Induction at AUBH Auditorium. Selected as one of only 10 university teams out of 35 applicants (~29% acceptance rate)! Received our official CanSat kit.',
    fullReport: {
      objectives: [
        'Confirm team registration for University of Technology Bahrain (UTB).',
        'Receive the official CanSat kit powered by BBK and organized by BSA & AUBH.',
        'Review the 7-week competition timeline toward the December 12 Launch Day.',
        'Establish team roles and setup our outreach & documentation channels.',
      ],
      completedMilestones: [
        'Team SKYLINK officially confirmed with 5 student leads and supervisor Dr. Sateesh Kumar Nataraj.',
        'Kit inspection completed: Arduino Nano, BMP180 altimeter, DHT11 temp/humidity, 6-axis IMU, 3-axis compass, 433MHz LoRa, and RGB camera.',
        'Official outreach channels launched: email (skylinkutb@gmail.com) and Linktree link-in-bio.',
      ],
      technicalDetails: [
        { label: 'Competition Form Factor', value: 'Ø 66 mm × 115 mm (350 ml)' },
        { label: 'Selected Teams', value: '10 teams out of 35 (~29% acceptance)' },
        { label: 'Supervising Body', value: 'Bahrain Space Agency (BSA) & AUBH' },
        { label: 'Outreach Weight', value: '10% of overall competition score' },
      ],
      quote:
        '"Being selected as one of the 10 university teams in the inaugural CanSat Bahrain Competition is an incredible honor for UTB. We are determined to build an outstanding mission."',
      nextSteps:
        'Attend Technical Session #1 at 6:00 PM for the Mission Concept Review (MCR) template walkthrough.',
    },
  },
  {
    id: 'mcr-kickoff-oct25',
    sessionNumber: 'Technical Session #1',
    title: 'MCR Kickoff & Mission Architecture Walkthrough',
    category: 'workshop',
    date: 'Sun, 25 October 2026',
    status: 'completed',
    trainerOrLocation: 'Ashraf Khater (BSA) • AUBH Auditorium',
    author: 'Osama Zahid',
    authorRole: 'Project Manager',
    tags: ['MCR', 'Kickoff', 'Mission Concept'],
    summary:
      'Walked through the official MCR template with trainer Ashraf Khater. Formulated Team SKYLINK’s mission objectives, secondary payload concept, and operational success criteria.',
    fullReport: {
      objectives: [
        'Break down primary mission requirements: sensor telemetry (pressure, temperature) at 1 Hz downlink.',
        'Define secondary payload mission: multi-spectral camera imaging and air quality index telemetry.',
        'Establish task allocations and schedule the 8 hours/week workload across all leads.',
      ],
      completedMilestones: [
        'Defined mission success criteria (Minimum, Full, and Outstanding).',
        'Established component verification testing on the breadboard prototype.',
        'Prepared the official PowerPoint presentation template for the MCR judges review.',
      ],
      technicalDetails: [
        { label: 'Telemetry Rate', value: '1 Hz continuous downlink' },
        { label: 'Radio Protocol', value: '433 MHz LoRa transceiver' },
        { label: 'Flight Controller', value: 'Arduino Nano Microcontroller' },
        { label: 'Primary Payload', value: 'RGB Camera + Atmospheric Sensors' },
      ],
      quote:
        '"Our secondary mission pairs real-time barometric descent calculation with automated camera triggering during the parachute glide phase."',
      nextSteps:
        'Submit MCR presentation slides by October 28 and rehearse for Sunday’s formal defense.',
    },
  },
  {
    id: 'mcr-presentation-nov1',
    sessionNumber: 'Milestone Review #1',
    title: 'MCR Defense Presentation to Bahrain Space Agency Judges',
    category: 'presentation',
    date: 'Sun, 1 November 2026',
    status: 'completed',
    trainerOrLocation: 'BSA Judging Panel • AUBH Auditorium',
    author: 'Osama Zahid',
    authorRole: 'Project Manager',
    tags: ['MCR', 'Presentation', 'Judges Defense', 'Approved'],
    summary:
      'Delivered our 7-minute MCR defense presentation to the Bahrain Space Agency engineering jury. Defended mission objectives, team roles, and sensor architecture with zero corrective action notices.',
    fullReport: {
      objectives: [
        'Present team roles, responsibilities, and workload distribution to BSA judges.',
        'Defend the feasibility and scientific merit of the SKYLINK CanSat architecture.',
        'Receive technical feedback before progressing to the Preliminary Design Review (PDR) stage.',
      ],
      completedMilestones: [
        'Successfully passed MCR milestone evaluation.',
        'Judges praised our robust risk management matrix and well-defined secondary payload.',
        'Approved to proceed directly into PDR engineering and component design.',
      ],
      technicalDetails: [
        { label: 'Presentation Format', value: '7 min defense + 3 min Q&A' },
        { label: 'Language', value: 'English (as required by BSA rules)' },
        { label: 'Milestone Status', value: 'Approved & Signed Off ✅' },
        { label: 'Next Milestone', value: 'PDR Kickoff with Marwan Almeer' },
      ],
      quote:
        '"The judges gave us fantastic guidance on optimizing our camera angle to prevent ground glare during early morning drop deployment."',
      nextSteps:
        'Commence PDR technical workshops covering mechanical CAD, power distribution, and parachute design.',
    },
  },
  {
    id: 'pdr-kickoff-nov1',
    sessionNumber: 'Technical Session #2',
    title: 'PDR Kickoff & Concept of Operations',
    category: 'workshop',
    date: 'Sun, 1 November 2026',
    status: 'completed',
    trainerOrLocation: 'Marwan Almeer • AUBH Auditorium',
    author: 'Mohsin Akil',
    authorRole: 'Mechanical Lead',
    tags: ['PDR Kickoff', 'CONOPS', 'Subsystems'],
    summary:
      'Attended Technical Session #2 led by Marwan Almeer. Learned the engineering standards for the PDR deliverable: block diagrams, mass/power/link budgets, and initial 3D CAD modeling.',
    fullReport: {
      objectives: [
        'Understand the specific scoring breakdown for the Preliminary Design Review.',
        'Formulate the Concept of Operations (CONOPS) from tower launch to ground recovery.',
        'Establish strict mass budget allocations (< 350 grams total payload + structure).',
      ],
      completedMilestones: [
        'Drafted the preliminary CONOPS timeline: pre-flight checks, tower deployment, freefall separation, parachute deployment, descent transmission, and touchdown beaconing.',
        'Assigned subsystem design responsibilities: Mechanical CAD to Mohsin, Electrical & RF to Mohammad Shoaib, and Software to Mohammad Ali.',
      ],
      technicalDetails: [
        { label: 'CONOPS Phases', value: '6 operational flight phases' },
        { label: 'Total Mass Target', value: '315g (with 35g safety margin)' },
        { label: 'Structure Envelope', value: 'Standard soda can envelope' },
        { label: 'Review Date', value: 'Sunday, 15 November 2026' },
      ],
      quote:
        '"PDR is where ideas transform into quantifiable engineering numbers. Every gram and milliamp must be accounted for."',
      nextSteps:
        'Attend Technical Sessions #3 and #4 covering mechanical systems and electrical schematics.',
    },
  },
  {
    id: 'mechanical-system-nov3',
    sessionNumber: 'Technical Session #3',
    title: 'Mechanical System Design, CAD & Mass Budget',
    category: 'engineering',
    date: 'Tue, 3 November 2026',
    status: 'completed',
    trainerOrLocation: 'Ashraf Khater • AUBH Auditorium',
    author: 'Mohsin Akil',
    authorRole: 'Mechanical Lead',
    tags: ['Mechanical', 'CAD', 'Mass Budget', 'Center of Mass'],
    summary:
      'Modeled the 3D internal structure of the CanSat in CAD. Balanced component placement to position the center of mass in the lower third for aerodynamically stable descent.',
    fullReport: {
      objectives: [
        'Design a 3D modular chassis capable of housing battery, PCB, sensor modules, and camera securely.',
        'Perform finite element calculations to ensure structural survival during drop impact.',
        'Calculate center of mass (CoM) to prevent inverted flipping under parachute.',
      ],
      completedMilestones: [
        'Generated full 3D CAD model using cylindrical interlocking bulkhead disks.',
        'Mass budget compiled: Structural chassis (78g), Electronics & sensors (92g), Battery (64g), Parachute & rigging (38g), Fasteners (12g). Total: 284g (well within 350g limit!).',
        'Center of mass confirmed at 38mm from the base, ensuring upright vertical attitude throughout flight.',
      ],
      technicalDetails: [
        { label: 'Chassis Diameter', value: '64.5 mm (fits 66mm tube)' },
        { label: 'Chassis Height', value: '112.0 mm (fits 115mm height)' },
        { label: 'Total Estimated Mass', value: '284.0 grams' },
        { label: 'Center of Mass', value: '38 mm from base (lower 34%)' },
      ],
      quote:
        '"By placing the battery at the very bottom bulkhead, our center of mass acts like a pendulum bob, naturally keeping the antenna pointing upward during parachute glide."',
      nextSteps:
        'Finalize STEP files for 3D printing session at AUBH D-Lab.',
    },
  },
  {
    id: 'electrical-system-nov3',
    sessionNumber: 'Technical Session #4',
    title: 'Electrical System Architecture, Power & Link Budgets',
    category: 'engineering',
    date: 'Tue, 3 November 2026',
    status: 'completed',
    trainerOrLocation: 'Reem Senan (BSA) • AUBH Auditorium',
    author: 'Mohammad Shoaib',
    authorRole: 'Electrical Lead',
    tags: ['Electrical', 'Power Budget', 'RF Link Budget', 'LoRa'],
    summary:
      'Engineered the complete functional block diagram, electrical power distribution, and 433 MHz LoRa link budget with trainer Reem Senan.',
    fullReport: {
      objectives: [
        'Create schematic wiring diagram linking Arduino Nano, sensors, camera, and LoRa transmitter.',
        'Calculate total power consumption across all flight phases to size battery capacity.',
        'Compute Friis transmission link budget to guarantee receiver sensitivity at ground station.',
      ],
      completedMilestones: [
        'Functional block diagram completed with isolated sensor power buses.',
        'Power budget calculated: Peak transmission current 140 mA, average current 85 mA. Sized 9V/LiPo battery for > 3.5 hours of continuous operation (far exceeding 30-minute mission requirement).',
        'RF link budget: +17.5 dB link margin calculated at 1.5 km distance with 433 MHz whip antenna.',
      ],
      technicalDetails: [
        { label: 'Average Current', value: '85 mA' },
        { label: 'Battery Capacity', value: '500 mAh (3.5+ hr endurance)' },
        { label: 'RF Downlink Power', value: '+20 dBm (100 mW)' },
        { label: 'RF Link Margin', value: '+17.5 dB @ 1.5 km LOS' },
      ],
      quote:
        '"Our power isolation circuit includes a hardware kill-switch and reverse-polarity protection so no unexpected voltage surges can damage the sensors during pre-launch checkout."',
      nextSteps:
        'Fabricate the prototype breadboard shield and test LoRa transmission to ground receiver.',
    },
  },
  {
    id: '3d-printing-nov8',
    sessionNumber: 'Technical Session #5 (CURRENT)',
    title: '3D Printing & Structural Fabrication at AUBH D-Lab',
    category: 'workshop',
    date: 'Current Session • November 2026',
    status: 'in_progress',
    trainerOrLocation: 'Khalid Engineer • AUBH D-Lab (Room E105)',
    author: 'Mohsin Akil',
    authorRole: 'Mechanical Lead',
    tags: ['3D Printing', 'D-Lab', 'Fabrication', 'In Progress', 'Active'],
    summary:
      'Currently in progress: hands-on structural fabrication and CAD printing session at the AUBH D-Lab with Khalid Engineer. Slicing and 3D printing our modular CanSat chassis using high-impact PETG.',
    fullReport: {
      objectives: [
        'Convert 3D CAD models into optimized G-code for additive manufacturing.',
        'Select filament material with optimal impact strength and temperature resistance.',
        'Print prototype bulkhead disks, camera mounting brackets, and antenna guide collars.',
      ],
      completedMilestones: [
        'Selected PETG filament with 35% gyroid infill for maximum strength-to-weight ratio.',
        'First test bulkheads and structural frame currently on the print bed.',
        'Physical test-fit of Arduino Nano and battery bay to confirm dimensional clearances.',
      ],
      technicalDetails: [
        { label: 'Filament Material', value: 'PETG (Polyethylene Terephthalate Glycol)' },
        { label: 'Infill Pattern', value: '35% Gyroid (isotropic strength)' },
        { label: 'Layer Height', value: '0.2 mm' },
        { label: 'Status', value: 'IN PROGRESS 🛠️' },
      ],
      quote:
        '"Fabricating at the AUBH D-Lab gives us precision manufacturing to ensure our electronics snap-fit securely into the 66mm rocket envelope."',
      nextSteps:
        'Complete chassis printing, finish clean-up of bulkhead tabs, and proceed to parachute canopy geometry.',
    },
  },
  {
    id: 'parachute-design-nov10',
    sessionNumber: 'Technical Session #6 (Upcoming)',
    title: 'Parachute Aerodynamics & Descent Rate Optimization',
    category: 'workshop',
    date: 'Upcoming Session • November 2026',
    status: 'upcoming',
    trainerOrLocation: 'AUBH Auditorium & D-Lab',
    author: 'Mohsin Akil',
    authorRole: 'Mechanical Lead',
    tags: ['Parachute', 'Aerodynamics', 'Upcoming', 'Descent Calculation'],
    summary:
      'Scheduled next: engineering and calculating the recovery parachute canopy area to guarantee terminal descent velocity below the mandatory 8.0 m/s threshold.',
    fullReport: {
      objectives: [
        'Apply aerodynamic drag equations ($v_t = \\sqrt{\\frac{2mg}{\\rho C_d A}}$) to size parachute canopy.',
        'Ensure touchdown speed is between 6.0 m/s and 8.0 m/s for safe recovery and sensor preservation.',
        'Design suspension line harness and test spill-hole venting for pitch stability.',
      ],
      completedMilestones: [
        'Preliminary canopy surface area target: 0.178 m² for 285g mass.',
        'Cross/Hexstar pattern template selected for anti-oscillation descent.',
      ],
      technicalDetails: [
        { label: 'Target Descent Speed', value: '6.7 m/s (< 8.0 m/s rule limit)' },
        { label: 'Canopy Pattern', value: 'Hexstar / Cross Pattern' },
        { label: 'Status', value: 'Scheduled / Upcoming ⏳' },
      ],
      quote:
        '"Our aerodynamic calculations aim for a 6.7 m/s steady glide, providing a safe margin under the 8 m/s limit."',
      nextSteps:
        'Fabricate parachute canopy from ripstop nylon and prepare for the PDR defense presentation.',
    },
  },
  {
    id: 'pdr-presentation-nov15',
    sessionNumber: 'Milestone Review #2 (Upcoming)',
    title: 'PDR Presentation Defense: Preliminary Design Review',
    category: 'presentation',
    date: 'Scheduled: Sun, 15 November 2026',
    status: 'upcoming',
    trainerOrLocation: 'BSA Judging Panel • AUBH Auditorium',
    author: 'Osama Zahid',
    authorRole: 'Project Manager',
    tags: ['PDR Defense', 'Judges Presentation', 'Milestone', 'Upcoming'],
    summary:
      'Upcoming milestone: presenting Team SKYLINK’s Preliminary Design Review (PDR) to the Bahrain Space Agency judges on Sunday, 15 November 2026.',
    fullReport: {
      objectives: [
        'Defend all subsystem designs before the Bahrain Space Agency technical panel.',
        'Demonstrate that mass (< 350g) and power (> 3.5 hr endurance) strictly comply with competition constraints.',
        'Showcase telemetry packet architecture, 433 MHz LoRa link margin, and parachute descent calculations.',
      ],
      completedMilestones: [
        'PDR presentation slide deck currently being assembled by the team leads.',
        'Subsystem CAD models and electrical block diagrams compiled for the judging panel.',
      ],
      technicalDetails: [
        { label: 'Milestone', value: 'Preliminary Design Review (PDR)' },
        { label: 'Scheduled Date', value: 'Sunday, 15 November 2026' },
        { label: 'Target Mass Ceiling', value: '< 350 grams' },
        { label: 'Status', value: 'Under Preparation ⏳' },
      ],
      quote:
        '"The PDR defense is our next major milestone. We are assembling our complete engineering budgets and CAD renders to defend our flight architecture."',
      nextSteps:
        'Finalize slide rehearsals and submit PDR deliverables before Sunday’s review.',
    },
  },
];

export function getStoredBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return DEFAULT_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (!raw) return DEFAULT_BLOG_POSTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BLOG_POSTS;
  } catch {
    return DEFAULT_BLOG_POSTS;
  }
}

export function saveBlogPost(post: BlogPost): void {
  const current = getStoredBlogPosts();
  const existingIdx = current.findIndex(p => p.id === post.id);
  let updated: BlogPost[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = post;
  } else {
    updated = [post, ...current];
  }
  try {
    localStorage.setItem(BLOG_KEY, JSON.stringify(updated));
  } catch {}
}

export function deleteBlogPost(id: string): void {
  const current = getStoredBlogPosts();
  const updated = current.filter(p => p.id !== id);
  try {
    localStorage.setItem(BLOG_KEY, JSON.stringify(updated));
  } catch {}
}

export function resetBlogPostsToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLOG_KEY, JSON.stringify(DEFAULT_BLOG_POSTS));
}
