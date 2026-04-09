import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { matchJobDescription } from '@/lib/api';
import type { Job } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeText: string;
  jobs: Job[];
}

const PLATFORMS = [
  { name: 'LinkedIn', color: 'bg-blue/15 text-blue' },
  { name: 'Indeed', color: 'bg-purple/15 text-purple' },
  { name: 'Naukri', color: 'bg-amber/15 text-amber' },
  { name: 'Glassdoor', color: 'bg-primary/15 text-primary' },
];

export default function JobsSection({ resumeText, jobs }: Props) {
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJDMatch = async () => {
    if (!jdText.trim() || !resumeText) return;
    setLoading(true);
    try {
      const result = await matchJobDescription(resumeText, jdText);
      setJdResult(result);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Job Matches</h2>
        <p className="text-muted-foreground text-sm mt-1">AI-matched positions based on your resume</p>
      </div>

      {/* JD Match */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Description Match (optional)</h3>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste a job description to check match..."
          className="w-full h-24 bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y"
        />
        <Button onClick={handleJDMatch} disabled={loading || !jdText.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Match Against JD
        </Button>
        {jdResult && (
          <div className="bg-secondary border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl text-primary">{jdResult.matchScore}%</span>
              <span className="text-sm text-muted-foreground">Match Score</span>
            </div>
            {jdResult.keywordGaps?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Missing Keywords:</p>
                <div className="flex flex-wrap gap-1.5">
                  {jdResult.keywordGaps.map((k: string) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Platforms */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Apply on Top Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <div key={p.name} className="flex items-center gap-3 bg-secondary border border-border rounded-lg px-4 py-4 hover:bg-muted transition-all cursor-pointer">
              <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center text-xs font-bold ${p.color}`}>
                {p.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">Search jobs →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job list */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Recommended Positions</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs found. Analyze your resume first.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {jobs.map((job, i) => (
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
                {job.description && (
                  <p className="hidden lg:block text-xs text-muted-foreground max-w-[200px] truncate">{job.description}</p>
                )}
                <ExternalLink className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
