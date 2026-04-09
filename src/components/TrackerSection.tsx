import { useState } from 'react';

interface TrackerItem {
  label: string;
  points: number;
  done: boolean;
}

interface AppLog {
  company: string;
  date: string;
}

const INITIAL_CHECKLIST: TrackerItem[] = [
  { label: 'Add quantifiable achievements', points: 8, done: false },
  { label: 'Include industry keywords', points: 7, done: false },
  { label: 'Use action verbs', points: 5, done: false },
  { label: 'Add skills section', points: 6, done: false },
  { label: 'Optimize formatting', points: 4, done: false },
  { label: 'Add certifications', points: 5, done: false },
  { label: 'Proofread for errors', points: 3, done: false },
];

export default function TrackerSection() {
  const [checklist, setChecklist] = useState<TrackerItem[]>(INITIAL_CHECKLIST);
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [newApp, setNewApp] = useState('');

  const toggleItem = (idx: number) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  const projectedScore = 60 + checklist.filter(c => c.done).reduce((sum, c) => sum + c.points, 0);

  const addLog = () => {
    if (!newApp.trim()) return;
    setLogs(prev => [...prev, { company: newApp.trim(), date: new Date().toLocaleDateString() }]);
    setNewApp('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Application Tracker</h2>
        <p className="text-muted-foreground text-sm mt-1">Track your job applications and ATS improvement progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Checklist */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">ATS Improvement Checklist</h3>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-secondary rounded-lg px-4 py-3 ${item.done ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleItem(i)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label className={`text-sm flex-1 cursor-pointer ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                  {item.label}
                </label>
                <span className="text-xs text-primary font-semibold">+{item.points}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-muted-foreground">Projected score:</span>
            <span className="font-display text-lg text-primary">{projectedScore}</span>
          </div>
        </div>

        {/* App log */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Applications Log</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">No applications logged yet.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {logs.map((log, i) => (
                <div key={i} className="flex justify-between bg-secondary rounded-lg px-4 py-2.5 text-sm">
                  <span>{log.company}</span>
                  <span className="text-muted-foreground text-xs">{log.date}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newApp}
              onChange={(e) => setNewApp(e.target.value)}
              placeholder="Company name..."
              onKeyDown={(e) => e.key === 'Enter' && addLog()}
              className="flex-1 bg-secondary border border-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none"
            />
            <button
              onClick={addLog}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
