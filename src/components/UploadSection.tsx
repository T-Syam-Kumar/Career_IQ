import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_RESUME } from '@/lib/types';
import { extractTextFromPDF } from '@/lib/resume-parser';
import { useToast } from '@/hooks/use-toast';

interface UploadSectionProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

export default function UploadSection({ onAnalyze, loading }: UploadSectionProps) {
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [dragover, setDragover] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    if (file.type === 'application/pdf') {
      try {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
      } catch {
        toast({ title: 'Error reading PDF', variant: 'destructive' });
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setResumeText(text);
    } else {
      toast({ title: 'Unsupported file', description: 'Please upload PDF or TXT', variant: 'destructive' });
    }
  }, [toast]);

  const loadDemo = () => {
    setResumeText(DEMO_RESUME);
    setFileName('📄 demo-resume.txt');
    toast({ title: 'Demo resume loaded!' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* Hero */}
      <div className="text-center max-w-[560px] mx-auto mb-10">
        <h1 className="font-display text-4xl tracking-tight mb-3">
          Transform your resume into <em className="text-primary italic">job opportunities</em>
        </h1>
        <p className="text-muted-foreground text-base font-light">
          AI-powered analysis, ATS scoring, job matching and career guidance — all in one platform.
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={`border-[1.5px] border-dashed rounded-lg p-12 text-center cursor-pointer transition-all max-w-[640px] mx-auto mb-6 relative ${
          dragover ? 'border-primary bg-primary/10' : 'border-input bg-card hover:border-primary hover:bg-primary/5'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragover(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <input
          type="file"
          accept=".pdf,.txt,.docx"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="w-14 h-14 bg-primary/15 rounded-[14px] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-base font-medium mb-1">Drop your resume here</h3>
        <p className="text-xs text-muted-foreground">Supports PDF, TXT · max 5MB</p>
        {fileName && <p className="text-primary font-medium text-sm mt-2">{fileName}</p>}
      </div>

      {/* Or text */}
      <p className="text-center text-xs text-muted-foreground mb-4">— or paste resume text below —</p>

      {/* Textarea */}
      <div className="max-w-[640px] mx-auto mb-6">
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="w-full h-40 bg-secondary border border-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center max-w-[640px] mx-auto mb-10">
        <Button
          onClick={() => onAnalyze(resumeText)}
          disabled={!resumeText.trim() || loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
        <Button variant="outline" onClick={loadDemo}>
          Load demo resume
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[640px] mx-auto">
        {[
          { icon: FileText, title: 'ATS Scoring', desc: 'Detailed breakdown with improvement path to 90+' },
          { icon: Sparkles, title: 'Job Matching', desc: 'AI-matched jobs across LinkedIn, Naukri & more' },
          { icon: FileText, title: 'Interview Prep', desc: 'AI-generated questions from your own resume' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border rounded-lg p-4">
            <div className="w-[30px] h-[30px] bg-primary/10 rounded-lg flex items-center justify-center mb-2.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-sm font-medium mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
