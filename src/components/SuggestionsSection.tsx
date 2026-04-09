import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { getSuggestions, streamRewrite } from '@/lib/api';
import type { Suggestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  resumeText: string;
  initialSuggestions: Suggestion[];
}

export default function SuggestionsSection({ resumeText, initialSuggestions }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [loading, setLoading] = useState(false);
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteOutput, setRewriteOutput] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (!resumeText) { toast({ title: 'Upload resume first', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const result = await getSuggestions(resumeText);
      setSuggestions(result);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) return;
    setRewriting(true);
    setRewriteOutput('');
    try {
      await streamRewrite(resumeText, rewriteText, setRewriteOutput, () => setRewriting(false));
    } catch (e: any) {
      toast({ title: 'Rewrite failed', description: e.message, variant: 'destructive' });
      setRewriting(false);
    }
  };

  const impactColor = (impact: string) => {
    if (impact === 'high') return 'bg-destructive/10 text-destructive';
    if (impact === 'medium') return 'bg-amber/10 text-amber';
    return 'bg-primary/10 text-primary';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight">AI Suggestions</h2>
          <p className="text-muted-foreground text-sm mt-1">Smart rewrites and improvements for your resume</p>
        </div>
        <Button size="sm" onClick={fetchSuggestions} disabled={loading || !resumeText}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <h3 className="font-display text-lg text-foreground mb-2">No analysis yet</h3>
          <p className="text-sm">Upload your resume first to get AI suggestions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="bg-secondary border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-medium">{s.title}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${impactColor(s.impact)}`}>
                  {s.impact}
                </span>
              </div>
              {s.description && <p className="text-xs text-muted-foreground mb-3">{s.description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="rounded-lg px-3 py-2.5 bg-destructive/5 border border-destructive/15">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Before</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.before}</div>
                </div>
                <div className="rounded-lg px-3 py-2.5 bg-primary/5 border border-primary/15">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">After</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom rewrite */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Rewrite Request</h3>
        <textarea
          value={rewriteText}
          onChange={(e) => setRewriteText(e.target.value)}
          placeholder="Paste a section of your resume to rewrite..."
          className="w-full h-24 bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y"
        />
        <Button onClick={handleRewrite} disabled={rewriting || !rewriteText.trim()}>
          {rewriting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Generate Rewrite
        </Button>
        {rewriteOutput && (
          <div className="bg-secondary border border-border rounded-lg p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {rewriteOutput}
            {rewriting && <span className="ai-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
