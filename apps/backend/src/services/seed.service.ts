import bcrypt from "bcryptjs";
import { AdminRepository } from "../repositories/admin.repository";
import { JobRepository } from "../repositories/job.repository";

const sampleJobs = [
  {
    title: "Senior Product Designer",
    location: "Kigali, Rwanda · Hybrid",
    employmentType: "Full-time",
    summary:
      "Shape useful, accessible experiences for the people building East Africa's next generation of products.",
    description:
      "Brightcore is looking for a thoughtful product designer to lead discovery and delivery across our core platform. You will work closely with product, engineering, and customers to turn complex workflows into clear, useful experiences.",
    responsibilities:
      "Lead research and design from discovery through launch.\nPartner with product and engineering on scope and implementation.\nCreate and maintain accessible interaction patterns.\nUse feedback and product data to improve shipped work.",
    requirements:
      "5+ years of product design experience.\nA portfolio showing strong interaction and visual design.\nComfort working with engineers in a fast-moving team.\nClear communication and a collaborative approach.",
  },
  {
    title: "Backend Engineer",
    location: "Kigali, Rwanda · Remote-friendly",
    employmentType: "Full-time",
    summary:
      "Build dependable APIs and services that help teams hire with more clarity and less friction.",
    description:
      "Join a small engineering team building reliable recruitment tools. You will own backend services, help shape our data model, and work with product partners to deliver features that are safe and easy to operate.",
    responsibilities:
      "Design and maintain API services and data models.\nImprove reliability, performance, and observability.\nCollaborate on technical planning and code reviews.\nHelp protect sensitive candidate information.",
    requirements:
      "3+ years building production backend systems.\nExperience with TypeScript or a comparable language.\nStrong SQL and API design fundamentals.\nCareful approach to security and reliability.",
  },
  {
    title: "People Operations Associate",
    location: "Kigali, Rwanda · On-site",
    employmentType: "Full-time",
    summary:
      "Make each candidate and teammate feel informed, welcomed, and supported.",
    description:
      "Support a positive hiring and employee experience across Brightcore. This role coordinates candidate communication, interviews, onboarding, and the operational details that keep our people programs running smoothly.",
    responsibilities:
      "Coordinate interviews and candidate communications.\nMaintain accurate hiring and onboarding records.\nSupport onboarding, team events, and people operations.\nIdentify small process improvements that make work easier.",
    requirements:
      "1+ years in people operations, recruiting, or administration.\nExcellent written and verbal communication.\nStrong organization and discretion.\nComfort using digital tools to manage workflows.",
  },
  {
    title: "Data Analyst",
    location: "Kigali, Rwanda · Hybrid",
    employmentType: "Contract",
    summary:
      "Turn product and hiring data into clear decisions for a growing team.",
    description:
      "Partner with product and operations to create trusted metrics and explain what they mean. You will build practical reporting, explore user behavior, and communicate findings that guide our next steps.",
    responsibilities:
      "Develop clear dashboards and recurring reports.\nAnalyze product and hiring funnel performance.\nWork with stakeholders to define useful metrics.\nDocument assumptions and data quality checks.",
    requirements:
      "2+ years in analytics or a related field.\nStrong SQL and spreadsheet skills.\nExperience with a BI or visualization tool.\nAble to explain technical findings in plain language.",
  },
];

export class SeedService {
  constructor(
    private readonly admins = new AdminRepository(),
    private readonly jobs = new JobRepository(),
  ) {}

  async ensureSeedData(): Promise<void> {
    const existingAdmin = await this.admins.findAny();
    if (!existingAdmin) {
      const email = (process.env.ADMIN_EMAIL ?? "admin@brightcore.test")
        .trim()
        .toLowerCase();
      const password =
        process.env.ADMIN_PASSWORD ??
        (process.env.NODE_ENV === "production" ? "" : "Admin@12345");
      if (!password) {
        throw new Error(
          "Set ADMIN_PASSWORD before starting Brightcore in production.",
        );
      }
      await this.admins.create({
        email,
        passwordHash: await bcrypt.hash(password, 12),
      });
    }

    const existingJob = await this.jobs.findAny();
    if (!existingJob) {
      const now = Date.now();
      await this.jobs.createMany(
        sampleJobs.map((job, index) => ({
          ...job,
          closingDate: new Date(
            new Date(now + (35 + index * 7) * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10) + "T00:00:00.000Z",
          ),
          status: "OPEN",
        })),
      );
    }
  }
}

export const seedService = new SeedService();
