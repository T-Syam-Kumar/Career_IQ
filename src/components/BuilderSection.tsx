import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { streamRewrite } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function BuilderSection() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    targetRole: '', experience: '', skills: '',
    workHistory: '', education: '', projects: '',
  });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const generate = async () => {
    if (!form.name || !form.skills) {
      toast({ title: 'Fill in at least name and skills', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setOutput('');
    const info = JSON.stringify(form);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ resumeText: info, action: 'build-resume', extra: { info: form } }),
      });
      if (!resp.ok || !resp.body) throw new Error('Failed to generate');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { full += content; setOutput(full); }
          } catch {}
        }
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', placeholder: 'john@email.com' },
    { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890' },
    { key: 'location', label: 'Location', placeholder: 'New York, NY' },
    { key: 'targetRole', label: 'Target Role', placeholder: 'Senior Frontend Developer' },
    { key: 'experience', label: 'Years of Experience', placeholder: '5' },
  ];

  const textFields = [
    { key: 'skills', label: 'Key Skills (comma-separated)', placeholder: 'React, TypeScript, Node.js...' },
    { key: 'workHistory', label: 'Work Experience Summary', placeholder: 'Describe your work history...' },
    { key: 'education', label: 'Education', placeholder: 'B.Tech CS, MIT 2020...' },
    { key: 'projects', label: 'Projects', placeholder: 'Notable projects...' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">AI Resume Builder</h2>
        <p className="text-muted-foreground text-sm mt-1">Create a professional, ATS-optimized resume</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
              <input
                type="text"
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="bg-secondary border border-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none"
              />
            </div>
          ))}
          {textFields.map(f => (
            <div key={f.key} className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
              <textarea
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y h-20"
              />
            </div>
          ))}
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Generate AI-Optimized Resume
        </Button>
      </div>

      {output && (
        <div className="bg-secondary border border-border rounded-lg p-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {output}
          {loading && <span className="ai-cursor" />}
        </div>
      )}
    </div>
  );
}
