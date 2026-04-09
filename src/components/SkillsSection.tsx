import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getLearningPath } from '@/lib/api';
import type { LearningItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeText: string;
  skills: string[];
  missingSkills: string[];
}

export default function SkillsSection({ resumeText, skills, missingSkills }: Props) {
  const [courses, setCourses] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePath = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const result = await getLearningPath(resumeText);
      setCourses(result);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Skill Gap Analysis</h2>
        <p className="text-muted-foreground text-sm mt-1">What you have vs. what the market needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">✓ Skills You Have</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="text-xs px-3 py-1 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">{s}</span>
            ))}
            {skills.length === 0 && <p className="text-sm text-muted-foreground">Analyze resume to see skills.</p>}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">✗ Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map(s => (
              <span key={s} className="text-xs px-3 py-1 rounded-full font-medium bg-destructive/10 text-destructive border border-destructive/20">{s}</span>
            ))}
            {missingSkills.length === 0 && <p className="text-sm text-muted-foreground">No gaps detected yet.</p>}
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Recommended Courses & Certifications</h3>
        {courses.length > 0 ? (
          <div className="space-y-2.5">
            {courses.map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-secondary border border-border border-l-[3px] border-l-blue rounded-r-lg px-4 py-3">
                <div className="w-9 h-9 bg-blue/10 rounded-lg flex items-center justify-center text-blue flex-shrink-0">📚</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.platform} · {c.duration} · {c.type}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Generate a learning path to see courses.</p>
        )}
      </div>

      <Button onClick={generatePath} disabled={loading || !resumeText}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Generate Learning Path
      </Button>
    </div>
  );
}
