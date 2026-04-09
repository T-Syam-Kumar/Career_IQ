import type { AnalysisResult, Job } from '@/lib/types';

interface DashboardSectionProps {
  analysis: AnalysisResult | null;
  jobs: Job[];
  onNavigate: (section: string) => void;
}

function ATSRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[100px] h-[100px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke="hsl(var(--primary))" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-primary leading-none">{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-[5px] bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function DashboardSection({ analysis, jobs, onNavigate }: DashboardSectionProps) {
  if (!analysis) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <h3 className="font-display text-lg text-foreground mb-2">No analysis yet</h3>
        <p className="text-sm">Upload your resume first to see the dashboard.</p>
      </div>
    );
  }

  const { atsScore, breakdown, skills, missingSkills, experience, summary, jobTitle } = analysis;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Career Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">{jobTitle || 'Your resume analysis'}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: 'ATS Score', value: `${atsScore}`, sub: atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs work', color: 'text-primary' },
          { label: 'Job Matches', value: `${jobs.length}`, sub: 'Across 4 platforms', color: 'text-amber' },
          { label: 'Skills Found', value: `${skills.length}`, sub: `${missingSkills.length} missing`, color: 'text-blue' },
          { label: 'Experience', value: experience || '—', sub: jobTitle || '—', color: 'text-purple' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
            <div className={`font-display text-3xl leading-none ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ATS Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">ATS Score Breakdown</h3>
          <div className="flex items-center gap-6 mb-5">
            <ATSRing score={atsScore} />
            <div className="flex-1 flex flex-col gap-3">
              <BreakdownBar label="Keywords" value={breakdown.keywords} color="bg-primary" />
              <BreakdownBar label="Formatting" value={breakdown.formatting} color="bg-amber" />
              <BreakdownBar label="Experience" value={breakdown.experience} color="bg-blue" />
              <BreakdownBar label="Skills" value={breakdown.skills} color="bg-purple" />
              <BreakdownBar label="Education" value={breakdown.education} color="bg-primary" />
            </div>
          </div>
          <button onClick={() => onNavigate('suggestions')} className="text-xs text-primary hover:underline">
            View improvement plan →
          </button>
        </div>

        {/* Top Jobs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Top Job Matches</h3>
          <div className="flex flex-col gap-2.5">
            {jobs.slice(0, 4).map((job, i) => (
              <a
                key={i}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-secondary border border-border rounded-lg px-4 py-3 hover:bg-muted transition-all"
              >
                <div className="w-9 h-9 rounded-[9px] bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{job.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{job.company} · {job.location}</div>
                </div>
                <span className="text-xs text-primary flex-shrink-0">Apply →</span>
              </a>
            ))}
            {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs found yet.</p>}
          </div>
          <button onClick={() => onNavigate('jobs')} className="text-xs text-primary hover:underline mt-3 block">
            See all matches →
          </button>
        </div>
      </div>

      {/* Skills + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Extracted Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <span key={s} className="text-xs px-3 py-1 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                {s}
              </span>
            ))}
          </div>
          {missingSkills.length > 0 && (
            <>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map(s => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full font-medium bg-destructive/10 text-destructive border border-destructive/20">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Resume Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}
