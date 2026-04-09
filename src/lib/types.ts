export const DEMO_RESUME = `PRIYA SHARMA
Full-Stack Developer
priya.sharma@email.com | +91 98765 43210 | github.com/priya-s

WORK EXPERIENCE

Software Engineer — Razorpay, Hyderabad (Jan 2022 – Present)
• Built and maintained React components for the payments dashboard used by 500K+ merchants
• Improved page load performance resulting in better user experience
• Collaborated with backend team on REST API integrations
• Participated in code reviews and mentored junior developers

Junior Frontend Developer — StartupXYZ, Hyderabad (Jul 2021 – Dec 2021)
• Developed responsive UI components using React and CSS
• Worked on cross-browser compatibility fixes
• Integrated third-party APIs

EDUCATION
B.Tech Computer Science — JNTU Hyderabad (2017–2021) | CGPA: 8.2/10

SKILLS
JavaScript, TypeScript, React, Node.js, HTML, CSS, SQL, Git, Jest, Figma, Agile

PROJECTS
• E-commerce dashboard — React, TypeScript, Chart.js
• Task management app — Node.js, Express, MongoDB`;

export interface AnalysisResult {
  atsScore: number;
  breakdown: {
    keywords: number;
    formatting: number;
    experience: number;
    skills: number;
    education: number;
  };
  skills: string[];
  missingSkills: string[];
  experience: string;
  summary: string;
  jobTitle: string;
  suggestions: Suggestion[];
}

export interface Suggestion {
  title: string;
  impact: 'high' | 'medium' | 'low';
  description?: string;
  before: string;
  after: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer: string;
}

export interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  matchScore?: number;
}

export interface LearningItem {
  title: string;
  platform: string;
  type: 'course' | 'certification' | 'tutorial';
  duration: string;
  priority: 'high' | 'medium' | 'low';
  url: string;
}

export type Section = 'upload' | 'dashboard' | 'suggestions' | 'jobs' | 'skills' | 'interview' | 'builder' | 'tracker';
