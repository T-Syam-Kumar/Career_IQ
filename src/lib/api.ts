import { supabase } from '@/integrations/supabase/client';
import type { AnalysisResult, InterviewQuestion, Suggestion, LearningItem, Job } from './types';

export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, action: 'analyze' },
  });
  if (error) throw new Error(error.message || 'Analysis failed');
  return data.result;
}

export async function getSuggestions(resumeText: string): Promise<Suggestion[]> {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, action: 'suggestions' },
  });
  if (error) throw new Error(error.message || 'Failed to get suggestions');
  return data.result;
}

export async function getInterviewQuestions(resumeText: string, targetRole?: string): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, action: 'interview', extra: { targetRole } },
  });
  if (error) throw new Error(error.message || 'Failed to generate questions');
  return data.result;
}

export async function matchJobDescription(resumeText: string, jobDescription: string) {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, action: 'jd-match', extra: { jobDescription } },
  });
  if (error) throw new Error(error.message || 'Failed to match JD');
  return data.result;
}

export async function getLearningPath(resumeText: string): Promise<LearningItem[]> {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, action: 'learning-path' },
  });
  if (error) throw new Error(error.message || 'Failed to generate learning path');
  return data.result;
}

export async function searchJobs(skills: string[]): Promise<Job[]> {
  const { data, error } = await supabase.functions.invoke('search-jobs', {
    body: { skills },
  });
  if (error) throw new Error(error.message || 'Job search failed');
  return data?.jobs || [];
}

export async function streamRewrite(
  resumeText: string,
  text: string,
  onDelta: (text: string) => void,
  onDone: () => void,
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ resumeText, action: 'rewrite', extra: { text } }),
  });
  if (!resp.ok || !resp.body) throw new Error('Stream failed');

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
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) { full += content; onDelta(full); }
      } catch { /* partial */ }
    }
  }
  onDone();
}
