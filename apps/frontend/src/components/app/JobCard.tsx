import { Job } from "@workspace/api-client-react";
import { ArrowUpRight, Building2, Clock3, MapPin } from "lucide-react";
import { Link } from "wouter";
import { dateLabel } from "../ui/shared";

export function JobCard({ job }: { job: Job }) {
    return (
        <Link href={`/jobs/${job.id}`} data-testid={`card-job-${job.id}`} className="group flex min-h-[236px] flex-col rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_14px_36px_-20px_rgba(37,77,60,.3)]"><div className="mb-5 flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Building2 className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-[#f6f3e9] px-2.5 py-1 text-[11px] font-semibold text-[#75623d]">{job.employmentType}</span>
        </div>
            <h3 className="text-lg font-bold leading-snug text-foreground transition group-hover:text-primary">{job.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />Closes {dateLabel(job.closingDate)}</span>
            </div>
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{job.summary}</p>
            <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-primary">
                View opportunity <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
        </Link>)
}