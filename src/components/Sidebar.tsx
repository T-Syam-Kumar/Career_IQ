import { Upload, LayoutDashboard, Sparkles, Briefcase, Target, MessageSquare, FileText, ClipboardList } from 'lucide-react';
import type { Section } from '@/lib/types';

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'upload', label: 'Upload Resume', icon: Upload },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles },
  { id: 'jobs', label: 'Job Matches', icon: Briefcase },
  { id: 'skills', label: 'Skill Gaps', icon: Target },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'builder', label: 'Resume Builder', icon: FileText },
  { id: 'tracker', label: 'App Tracker', icon: ClipboardList },
];

interface SidebarProps {
  active: Section;
  onNavigate: (s: Section) => void;
  atsScore: number | null;
}

export default function Sidebar({ active, onNavigate, atsScore }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 bg-card border-r border-border flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pb-7 pt-6 border-b border-border mb-5">
        <div className="w-[34px] h-[34px] bg-primary rounded-[9px] flex items-center justify-center">
          <Sparkles className="w-[18px] h-[18px] text-primary-foreground" />
        </div>
        <span className="font-display text-xl text-foreground tracking-tight">
          Career<em className="text-primary not-italic">IQ</em>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm transition-all border-l-2 ${
              active === id
                ? 'text-primary bg-sidebar-accent border-l-primary'
                : 'text-muted-foreground border-l-transparent hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer score */}
      <div className="mt-auto px-5 pt-4 pb-6 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">ATS Score</span>
          <span className="text-xl font-display text-primary">{atsScore ?? '—'}</span>
        </div>
        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${atsScore ?? 0}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
