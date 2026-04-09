import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getInterviewQuestions } from '@/lib/api';
import type { InterviewQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeText: string;
}

export default function InterviewSection({ resumeText }: Props) {
  const [targetRole, setTargetRole] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (!resumeText) { toast({ title: 'Upload resume first', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const result = await getInterviewQuestions(resumeText, targetRole || undefined);
      setQuestions(result);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const diffColor = (d: string) => {
    if (d === 'hard') return 'bg-destructive/10 text-destructive';
    if (d === 'medium') return 'bg-amber/10 text-amber';
    return 'bg-primary/10 text-primary';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Interview Preparation</h2>
        <p className="text-muted-foreground text-sm mt-1">Questions tailored to your resume and target role</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Role (optional)</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            className="flex-1 bg-secondary border border-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none"
          />
          <Button onClick={generate} disabled={loading || !resumeText}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generate Questions
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <h3 className="font-display text-lg text-foreground mb-2">No questions yet</h3>
          <p className="text-sm">Generate interview questions above, or analyze your resume first.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q, i) => (
            <div key={i} className="bg-secondary border border-border border-l-[3px] border-l-purple rounded-r-lg p-4">
              <p className="text-sm leading-relaxed mb-2">{q.question}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple/10 text-purple">{q.category}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
              </div>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="text-xs text-primary hover:underline mt-2"
              >
                {openIdx === i ? 'Hide answer' : 'Show sample answer'}
              </button>
              {openIdx === i && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed">
                  {q.sampleAnswer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
