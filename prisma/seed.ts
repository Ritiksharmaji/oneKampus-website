// Seeds the catalogue with oneKampus content. Safe to run again: everything is upserted by slug/key.
// Store prices are indicative sample prices — edit them in Admin → Products.
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const solutions = [
  {
    slug: "manage",
    name: "oneKampus Manage",
    tagline: "Run your whole institute from one place",
    summary:
      "The institute management system (ERP): staff, branches, admissions, students and guardians, fees, timetable, attendance, marks, report cards and a parent/student portal.",
    icon: "/brand/onekampus-manage-icon.svg",
    highlights: ["Admissions to report cards", "Fees, receipts & expenses", "Parent and student portal"],
    audiences: ["Schools", "Colleges", "Coaching institutes", "Training centres"],
    features: [
      { title: "Enquiries to admissions", description: "Capture enquiries, follow them up and convert them into admissions with student and guardian records." },
      { title: "Fees and receipts", description: "Fee structures, instalments, collections, printable receipts and dues reports for the accounts team." },
      { title: "Timetable and attendance", description: "Build timetables for every batch and mark daily attendance from the web or the mobile app." },
      { title: "Marks and report cards", description: "Enter marks, publish results and generate report cards in a few clicks." },
      { title: "Branches and staff", description: "Manage several branches, staff roles (owner, admin, accountant, teacher) and their permissions." },
      { title: "Classwork and announcements", description: "Share homework, classwork and notices with students and parents instantly." },
      { title: "Expenses and reports", description: "Track expenses and see collections, attendance and performance reports at a glance." },
      { title: "Parent and student portal", description: "Parents and students see attendance, fees, marks and announcements on the web and the app." },
    ],
    faqs: [
      { q: "Can we manage more than one branch?", a: "Yes. One institute account can hold any number of branches, each with its own staff, batches and reports." },
      { q: "Is there a mobile app?", a: "Yes. The oneKampus app for iOS and Android covers staff, parents and students." },
      { q: "Can you import our existing student data?", a: "Yes. Our team imports your existing students, guardians and fee data from Excel/CSV during setup." },
    ],
    order: 1,
  },
  {
    slug: "learn",
    name: "oneKampus Learn",
    tagline: "Teach online with your own learning platform",
    summary:
      "A learning management system (LMS) for online courses: lessons, video, quizzes, assignments, gradebook, live sessions, discussions and certificates — with checkout to sell courses.",
    icon: "/brand/onekampus-learn-icon.svg",
    highlights: ["Video lessons & quizzes", "Live sessions & discussions", "Certificates & course sales"],
    audiences: ["Schools", "Coaching institutes", "Universities", "Independent educators"],
    features: [
      { title: "Courses and lessons", description: "Build courses with video, documents and text lessons organised into sections." },
      { title: "Quizzes and assignments", description: "Auto-graded quizzes and assignment submissions with teacher feedback." },
      { title: "Gradebook", description: "Every learner's progress and scores in one gradebook for teachers." },
      { title: "Live sessions", description: "Schedule live classes and keep the recordings with the course." },
      { title: "Discussions", description: "Course discussion boards where learners ask and teachers answer." },
      { title: "Certificates", description: "Issue completion certificates automatically when a learner finishes." },
      { title: "Sell courses", description: "Checkout and orders so you can sell courses online." },
      { title: "Single sign-on", description: "Institute members use the same login as oneKampus Manage." },
    ],
    faqs: [
      { q: "Do we need oneKampus Manage to use Learn?", a: "No. Learn works on its own, and if you also use Manage your students sign in with one account." },
      { q: "Can we sell paid courses?", a: "Yes. Courses can be free or paid, with online checkout and order history." },
    ],
    order: 2,
  },
  {
    slug: "assess",
    name: "oneKampus Assess",
    tagline: "Online exams with proctoring, grading and ranks",
    summary:
      "An exam portal with question banks, papers, scheduled exams, a full-screen proctored exam player, automatic and manual grading, ranks, percentiles and results.",
    icon: "/brand/onekampus-assess-icon.svg",
    highlights: ["Question banks & papers", "Proctored full-screen exams", "Ranks, percentiles & results"],
    audiences: ["Schools", "Coaching institutes", "Entrance-exam preparation", "Recruiters"],
    features: [
      { title: "Question banks", description: "Build reusable question banks by subject, topic and difficulty." },
      { title: "Papers and scheduling", description: "Create papers and schedule exams for whole batches or chosen students." },
      { title: "Proctored exam player", description: "A full-screen exam player in the browser that discourages switching away." },
      { title: "Auto and manual grading", description: "Objective questions are graded instantly; teachers grade descriptive answers." },
      { title: "Ranks and percentiles", description: "Publish results with ranks and percentiles for every candidate." },
      { title: "Results on the phone", description: "Candidates register and see their results on the mobile app." },
    ],
    faqs: [
      { q: "Can students take exams on the phone?", a: "Exams are taken in the browser on a computer for proctoring; registration and results are available on the app." },
    ],
    order: 3,
  },
  {
    slug: "hire",
    name: "oneKampus Hire",
    tagline: "Recruit teachers and staff with interviews in the browser",
    summary:
      "Interview and hiring for institutes: your own careers page, applications and pipeline, live and recorded video interviews, blind scorecards, offers and a staff login on hire.",
    icon: "/brand/onekampus-hire-icon.svg",
    highlights: ["Careers page & pipeline", "Live & recorded video interviews", "Offers to staff login"],
    audiences: ["Schools", "College groups", "Coaching chains"],
    features: [
      { title: "Careers page", description: "A careers page for your institute where applicants browse jobs and apply." },
      { title: "Applications pipeline", description: "Move applicants through stages from applied to hired." },
      { title: "Video interviews", description: "Live interviews and recorded-answer interviews right in the browser — no extra software." },
      { title: "Blind scorecards", description: "Each panel member scores independently for fair decisions." },
      { title: "Offers and onboarding", description: "Send offers and turn a hired applicant into a staff login in oneKampus Manage." },
    ],
    faqs: [
      { q: "Do candidates need to install anything?", a: "No. Interviews run in the browser; candidates can also browse jobs and apply on the phone." },
    ],
    order: 4,
  },
  {
    slug: "mobile-app",
    name: "oneKampus App",
    tagline: "Your institute in every pocket — iOS and Android",
    summary:
      "One mobile app for staff, parents, students and applicants: switch between Institute and Learning, see exams and results, and browse jobs.",
    icon: "/brand/onekampus-icon.svg",
    highlights: ["iOS + Android", "Staff, parents & students", "Institute and Learning in one app"],
    audiences: ["Parents", "Students", "Teachers", "Institute staff"],
    features: [
      { title: "One app, every role", description: "Staff, parents and students sign in to the same app and see what matters to them." },
      { title: "Institute and Learning", description: "Switch between institute life (attendance, fees, notices) and online learning." },
      { title: "Exams tab", description: "Register for exams and check results on the go." },
      { title: "Jobs for applicants", description: "Applicants browse open jobs and apply from the phone." },
    ],
    faqs: [],
    order: 5,
  },
  {
    slug: "websites",
    name: "oneKampus Sites",
    tagline: "A professional website for your institute",
    summary:
      "Ready-made, mobile-friendly websites for schools and colleges with admissions enquiries, galleries, notices and an easy editor for your staff.",
    icon: "Globe",
    highlights: ["Ready-made school templates", "Admission enquiries to your inbox", "Edit without a developer"],
    audiences: ["Schools", "Colleges", "Universities"],
    features: [
      { title: "School and college templates", description: "Pick a template and switch on the sections you need: about, academics, admissions, gallery, notices." },
      { title: "Admission enquiries", description: "Enquiries from your website arrive in your inbox and dashboard." },
      { title: "Easy editing", description: "Your staff update text, photos and notices without a developer." },
      { title: "Your own domain", description: "Hosted on your institute's domain with SSL and search-engine basics set up." },
    ],
    faqs: [],
    order: 6,
  },
];

const categories = [
  { slug: "notebooks", name: "Notebooks & Registers", icon: "NotebookPen", description: "Ruled, unruled and practical notebooks, long books and registers — printed with your institute's name and logo.", order: 1 },
  { slug: "uniforms", name: "Uniforms & Dress", icon: "Shirt", description: "Shirts, trousers, skirts, blazers, sportswear, ties and belts made to your school's colours and sizes.", order: 2 },
  { slug: "stationery", name: "Stationery", icon: "PenLine", description: "Pens, pencils, geometry boxes, files and art supplies for students and staff.", order: 3 },
  { slug: "id-accessories", name: "ID Cards & Accessories", icon: "IdCard", description: "PVC ID cards, lanyards, badges and belts printed for your institute.", order: 4 },
  { slug: "bags", name: "Bags", icon: "Backpack", description: "School bags, laptop bags and pouches with your logo.", order: 5 },
  { slug: "printing", name: "Diaries & Printing", icon: "BookOpen", description: "School diaries, calendars, certificates, report-card folders and stationery printing.", order: 6 },
];

type ProductSeed = {
  slug: string; name: string; category: string; summary: string; description: string;
  specs: { label: string; value: string }[]; options: { name: string; values: string[] }[];
  customizable: boolean; customizationNote?: string; moq: number; unit: string;
  priceTiers: { minQty: number; price: number }[]; featured?: boolean;
};

const products: ProductSeed[] = [
  { slug: "single-line-notebook", name: "Single-line Notebook", category: "notebooks", featured: true,
    summary: "Everyday ruled notebook with a printed cover in your school's design.",
    description: "Smooth 58 GSM paper, single-line ruling and a sturdy laminated cover. We print your institute's name, logo and a timetable on the back cover.",
    specs: [{ label: "Paper", value: "58 GSM maplitho" }, { label: "Size", value: "18 × 24 cm" }, { label: "Binding", value: "Stitched" }],
    options: [{ name: "Pages", values: ["120", "172", "240"] }],
    customizable: true, customizationNote: "Cover printed with your logo, name and timetable", moq: 500, unit: "notebook",
    priceTiers: [{ minQty: 500, price: 32 }, { minQty: 2000, price: 28 }, { minQty: 5000, price: 25 }] },
  { slug: "long-notebook", name: "Long Notebook", category: "notebooks",
    summary: "Long-size ruled notebook for senior classes and colleges.",
    description: "Long format (21 × 33 cm), single-line ruling, laminated soft cover with your institute branding.",
    specs: [{ label: "Paper", value: "58 GSM" }, { label: "Size", value: "21 × 33 cm" }],
    options: [{ name: "Pages", values: ["160", "200", "240"] }],
    customizable: true, customizationNote: "Cover printed with your logo", moq: 500, unit: "notebook",
    priceTiers: [{ minQty: 500, price: 55 }, { minQty: 2000, price: 49 }] },
  { slug: "practical-file", name: "Practical Notebook", category: "notebooks",
    summary: "Interleaved practical notebook — one ruled page, one plain page.",
    description: "For science practicals: alternating ruled and drawing pages on 70 GSM paper with a hard cover.",
    specs: [{ label: "Paper", value: "70 GSM" }, { label: "Pages", value: "100 (interleaved)" }],
    options: [{ name: "Subject", values: ["Physics", "Chemistry", "Biology", "Computer"] }],
    customizable: true, customizationNote: "Cover with subject and school name", moq: 300, unit: "notebook",
    priceTiers: [{ minQty: 300, price: 70 }, { minQty: 1000, price: 62 }] },
  { slug: "attendance-register", name: "Attendance Register", category: "notebooks",
    summary: "Hard-bound attendance register laid out for your classes.",
    description: "Pre-printed attendance grids for a full academic year, hard-bound for daily use by teachers.",
    specs: [{ label: "Pages", value: "200" }, { label: "Binding", value: "Hard-bound" }],
    options: [], customizable: true, customizationNote: "Printed with your class and session details", moq: 50, unit: "register",
    priceTiers: [{ minQty: 50, price: 180 }, { minQty: 200, price: 160 }] },

  { slug: "school-shirt", name: "School Shirt", category: "uniforms", featured: true,
    summary: "Comfortable poly-cotton school shirt in your uniform colour.",
    description: "Durable poly-cotton fabric that survives daily washing, with optional embroidered school logo on the pocket.",
    specs: [{ label: "Fabric", value: "65% poly / 35% cotton" }, { label: "Fit", value: "Regular" }],
    options: [{ name: "Sleeve", values: ["Half", "Full"] }, { name: "Size", values: ["22", "24", "26", "28", "30", "32", "34", "36", "38", "40"] }],
    customizable: true, customizationNote: "Logo embroidery and colour matched to your uniform", moq: 100, unit: "shirt",
    priceTiers: [{ minQty: 100, price: 320 }, { minQty: 500, price: 285 }] },
  { slug: "school-trousers", name: "Trousers / Skirt", category: "uniforms",
    summary: "Uniform trousers and skirts tailored in standard school sizes.",
    description: "Wrinkle-resistant suiting fabric in your uniform shade, available in all standard sizes.",
    specs: [{ label: "Fabric", value: "Poly-viscose suiting" }],
    options: [{ name: "Type", values: ["Trousers", "Skirt", "Shorts"] }, { name: "Size", values: ["22", "24", "26", "28", "30", "32", "34", "36"] }],
    customizable: true, customizationNote: "Colour matched to your uniform", moq: 100, unit: "piece",
    priceTiers: [{ minQty: 100, price: 380 }, { minQty: 500, price: 340 }] },
  { slug: "blazer", name: "School Blazer", category: "uniforms",
    summary: "Winter blazer with embroidered crest.",
    description: "Lined blazer in your school colour with an embroidered crest on the chest pocket.",
    specs: [{ label: "Lining", value: "Full" }],
    options: [{ name: "Size", values: ["24", "26", "28", "30", "32", "34", "36", "38", "40", "42"] }],
    customizable: true, customizationNote: "Embroidered school crest", moq: 50, unit: "blazer",
    priceTiers: [{ minQty: 50, price: 1350 }, { minQty: 200, price: 1200 }] },
  { slug: "sports-tshirt", name: "Sports / House T-shirt", category: "uniforms",
    summary: "Breathable dri-fit T-shirts for PT and house activities.",
    description: "Lightweight dri-fit fabric in house colours with printed school logo and house name.",
    specs: [{ label: "Fabric", value: "Dri-fit polyester" }],
    options: [{ name: "Colour", values: ["Red", "Blue", "Green", "Yellow", "White"] }, { name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
    customizable: true, customizationNote: "Printed logo and house name", moq: 100, unit: "T-shirt",
    priceTiers: [{ minQty: 100, price: 240 }, { minQty: 500, price: 210 }] },
  { slug: "tie-belt-set", name: "Tie & Belt Set", category: "uniforms",
    summary: "School tie and belt with woven logo.",
    description: "Woven tie in school stripes and an elastic belt with a printed or metal buckle logo.",
    specs: [], options: [{ name: "Tie", values: ["Regular", "Elastic (junior)"] }],
    customizable: true, customizationNote: "School stripes and logo buckle", moq: 200, unit: "set",
    priceTiers: [{ minQty: 200, price: 150 }, { minQty: 1000, price: 130 }] },

  { slug: "ball-pen-pack", name: "Ball Pen Pack", category: "stationery", featured: true,
    summary: "Smooth-writing ball pens, plain or printed with your logo.",
    description: "Reliable 0.7 mm ball pens for students and staff. Printed pens make great admission-day and event giveaways.",
    specs: [{ label: "Tip", value: "0.7 mm" }],
    options: [{ name: "Ink", values: ["Blue", "Black", "Red"] }],
    customizable: true, customizationNote: "Logo printed on the barrel", moq: 500, unit: "pen",
    priceTiers: [{ minQty: 500, price: 6 }, { minQty: 5000, price: 4.5 }] },
  { slug: "pencil-kit", name: "Pencil Kit", category: "stationery",
    summary: "HB pencils with eraser and sharpener.",
    description: "A box of 10 HB pencils with an eraser and a sharpener — ready for the first day of school.",
    specs: [{ label: "Contents", value: "10 pencils, eraser, sharpener" }],
    options: [], customizable: false, moq: 100, unit: "kit",
    priceTiers: [{ minQty: 100, price: 45 }, { minQty: 1000, price: 39 }] },
  { slug: "geometry-box", name: "Geometry Box", category: "stationery",
    summary: "Complete mathematical instrument box.",
    description: "Compass, divider, protractor, set squares, scale, pencil and eraser in a metal box.",
    specs: [{ label: "Box", value: "Metal" }],
    options: [], customizable: true, customizationNote: "Logo sticker on the lid", moq: 100, unit: "box",
    priceTiers: [{ minQty: 100, price: 120 }, { minQty: 500, price: 105 }] },
  { slug: "exam-pad-files", name: "Exam Pads & Files", category: "stationery",
    summary: "Clip-board exam pads and document files.",
    description: "Hardboard exam pads with clips and plastic document files, printable with your logo.",
    specs: [], options: [{ name: "Item", values: ["Exam pad", "Button file", "Clear bag file"] }],
    customizable: true, customizationNote: "Logo printing", moq: 200, unit: "piece",
    priceTiers: [{ minQty: 200, price: 55 }, { minQty: 1000, price: 48 }] },

  { slug: "pvc-id-card", name: "PVC ID Card", category: "id-accessories", featured: true,
    summary: "Printed student and staff ID cards with photo.",
    description: "Durable PVC ID cards printed in full colour with photo, name, class, blood group and QR/barcode. Send us your data in Excel and photos — we print them all.",
    specs: [{ label: "Size", value: "CR80 (85.6 × 54 mm)" }, { label: "Print", value: "Both sides, full colour" }],
    options: [{ name: "Orientation", values: ["Vertical", "Horizontal"] }],
    customizable: true, customizationNote: "Your design with photo and data for each student", moq: 100, unit: "card",
    priceTiers: [{ minQty: 100, price: 28 }, { minQty: 1000, price: 22 }] },
  { slug: "lanyard", name: "Printed Lanyard", category: "id-accessories",
    summary: "Lanyards printed with your institute name.",
    description: "Satin or polyester lanyards with full-length printing and a card holder.",
    specs: [{ label: "Width", value: "16 / 20 mm" }],
    options: [{ name: "Width", values: ["16 mm", "20 mm"] }],
    customizable: true, customizationNote: "Full-length name printing", moq: 100, unit: "lanyard",
    priceTiers: [{ minQty: 100, price: 25 }, { minQty: 1000, price: 18 }] },

  { slug: "school-bag", name: "School Bag", category: "bags",
    summary: "Ergonomic school backpack with your logo.",
    description: "Padded shoulder straps, water-resistant fabric and multiple compartments, with your school logo.",
    specs: [{ label: "Capacity", value: "25–32 L" }],
    options: [{ name: "Size", values: ["Junior", "Senior"] }],
    customizable: true, customizationNote: "Logo print or embroidery", moq: 100, unit: "bag",
    priceTiers: [{ minQty: 100, price: 650 }, { minQty: 500, price: 580 }] },

  { slug: "school-diary", name: "School Diary", category: "printing", featured: true,
    summary: "Custom school diary for the academic year.",
    description: "Your school calendar, rules, timetable, homework pages and parent-communication pages in a printed diary.",
    specs: [{ label: "Pages", value: "160–240" }, { label: "Cover", value: "Hard or soft" }],
    options: [{ name: "Cover", values: ["Hard cover", "Soft cover"] }],
    customizable: true, customizationNote: "Fully designed for your school", moq: 200, unit: "diary",
    priceTiers: [{ minQty: 200, price: 95 }, { minQty: 1000, price: 82 }] },
  { slug: "certificates", name: "Certificates & Report-card Folders", category: "printing",
    summary: "Printed certificates, report-card folders and merit cards.",
    description: "Premium-paper certificates for events and results, and folders for report cards.",
    specs: [{ label: "Paper", value: "250–300 GSM" }],
    options: [{ name: "Item", values: ["Certificate", "Report-card folder", "Merit card"] }],
    customizable: true, customizationNote: "Designed with your crest", moq: 100, unit: "piece",
    priceTiers: [{ minQty: 100, price: 18 }, { minQty: 1000, price: 12 }] },
];

const services = [
  { slug: "printing-branding", name: "Printing & Branding", icon: "Printer", order: 1,
    summary: "Everything with your institute's name on it, designed and printed by us.",
    points: ["Notebook covers, diaries and calendars", "ID cards, certificates and report-card folders", "Banners, standees and admission brochures"] },
  { slug: "setup-migration", name: "Setup & Data Migration", icon: "DatabaseZap", order: 2,
    summary: "We set up oneKampus for your institute and bring your existing data in.",
    points: ["Students, guardians and staff imported from Excel", "Fee structures, batches and timetables configured", "Your branding on the web and app"] },
  { slug: "training-support", name: "Training & Support", icon: "Headset", order: 3,
    summary: "Hands-on training for your staff and support whenever you need it.",
    points: ["On-site or online staff training", "Guides for teachers, parents and students", "Phone and email support"] },
  { slug: "it-infrastructure", name: "Smart Classroom & IT", icon: "MonitorSmartphone", order: 4,
    summary: "Hardware and networking to make your campus digital.",
    points: ["Smart boards and projectors", "Computer labs and Wi-Fi", "Biometric and RFID attendance devices"] },
  { slug: "events", name: "Events & Annual-day Supplies", icon: "PartyPopper", order: 5,
    summary: "Supplies and printing for sports day, annual day and admissions season.",
    points: ["House T-shirts and medals", "Stage backdrops and certificates", "Admission-season kits"] },
];

const testimonials = [
  { name: "Sample Principal", role: "Principal", institution: "Sample Public School", order: 1,
    quote: "Replace this sample with a real testimonial from one of your institutes, then publish it." },
];

const settings = {
  companyName: "oneKampus",
  email: "ritiksharma555598@gmail.com",
  phone: "+91 62094 40270",
  address: "Your office address, City, State – PIN",
  hours: "Mon–Sat, 9:30 am – 6:30 pm",
  heroTitle: "Everything your institute needs. One partner.",
  heroSubtitle:
    "Software to run, teach, examine and hire — and the notebooks, uniforms and stationery your students use every day. Delivered by oneKampus.",
  stats: [
    { value: "5", label: "software products, one sign-in" },
    { value: "iOS + Android", label: "mobile app for every role" },
    { value: "6", label: "store categories, all custom-printed" },
    { value: "1", label: "partner for software and supplies" },
  ],
  social: [],
};

async function main() {
  for (const s of solutions) {
    await db.solution.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await db.productCategory.upsert({ where: { slug: c.slug }, update: c, create: c });
    categoryIds[c.slug] = row.id;
  }

  for (const [i, { category, ...p }] of products.entries()) {
    const data = { ...p, categoryId: categoryIds[category], order: i };
    // Placeholder photo from public/store (see CREDITS.md); never replaces a photo uploaded in admin.
    const image = `/store/${p.slug}.jpg`;
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: { ...data, image } });
    await db.product.updateMany({ where: { slug: p.slug, image: null }, data: { image } });
  }

  for (const s of services) {
    await db.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({ data: testimonials });
  }

  await db.setting.upsert({ where: { key: "site" }, update: {}, create: { key: "site", value: settings } });

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const exists = await db.user.findUnique({ where: { email } });
    if (!exists) {
      await db.user.create({
        data: { name: "Admin", email, role: Role.ADMIN, passwordHash: await bcrypt.hash(password, 10) },
      });
      console.log(`Created admin ${email}`);
    }
  } else {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — no admin user created.");
  }

  console.log(`Seeded ${solutions.length} solutions, ${categories.length} categories, ${products.length} products, ${services.length} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
