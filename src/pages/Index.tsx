import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UploadSection from '@/components/UploadSection';
import DashboardSection from '@/components/DashboardSection';
import SuggestionsSection from '@/components/SuggestionsSection';
import JobsSection from '@/components/JobsSection';
import SkillsSection from '@/components/SkillsSection';
import InterviewSection from '@/components/InterviewSection';
import BuilderSection from '@/components/BuilderSection';
import TrackerSection from '@/components/TrackerSection';
import { analyzeResume, searchJobs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Section, AnalysisResult, Job } from '@/lib/types';

const Index = () => {
  const [section, setSection] = useState<Section>('upload');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setResumeText(text);
    setLoading(true);

    try {
      // Run AI analysis
      const result = await analyzeResume(text);
      setAnalysis(result);

      // Search for real jobs using detected skills
      if (result.skills.length > 0) {
        try {
          const foundJobs = await searchJobs(result.skills.slice(0, 5));
          setJobs(foundJobs);
        } catch {
          // Jobs are optional, don't block on failure
        }
      }

      setSection('dashboard');
      toast({ title: 'Analysis complete!', description: `ATS Score: ${result.atsScore}/100` });
    } catch (e: any) {
      toast({ title: 'Analysis failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return (
    <div className="flex min-h-screen">
      <Sidebar active={section} onNavigate={setSection} atsScore={analysis?.atsScore ?? null} />

      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-background sticky top-0 z-10">
          <h2 className="font-display text-xl tracking-tight">
            CareerIQ
            <span className="text-muted-foreground font-body text-xs font-light ml-2.5">
              {analysis ? analysis.jobTitle || 'Resume analyzed' : 'Upload your resume to get started'}
            </span>
          </h2>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-background/85 z-50 flex flex-col items-center justify-center gap-5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Analyzing your resume with AI...</p>
            <div className="flex flex-col gap-1.5">
              {['Parsing resume content...', 'Calculating ATS score...', 'Matching jobs...', 'Generating suggestions...'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {section === 'upload' && <UploadSection onAnalyze={handleAnalyze} loading={loading} />}
          {section === 'dashboard' && <DashboardSection analysis={analysis} jobs={jobs} onNavigate={(s) => setSection(s as Section)} />}
          {section === 'suggestions' && <SuggestionsSection resumeText={resumeText} initialSuggestions={analysis?.suggestions || []} />}
          {section === 'jobs' && <JobsSection resumeText={resumeText} jobs={jobs} />}
          {section === 'skills' && <SkillsSection resumeText={resumeText} skills={analysis?.skills || []} missingSkills={analysis?.missingSkills || []} />}
          {section === 'interview' && <InterviewSection resumeText={resumeText} />}
          {section === 'builder' && <BuilderSection />}
          {section === 'tracker' && <TrackerSection />}
        </div>
      </main>
    </div>
  );
};

export default Index;
