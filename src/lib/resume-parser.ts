import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

const SKILLS_DB = [
  "python", "java", "javascript", "typescript", "react", "angular", "vue",
  "django", "flask", "node.js", "express", "sql", "mysql", "postgresql",
  "mongodb", "html", "css", "tailwind", "docker", "kubernetes", "aws",
  "azure", "gcp", "git", "linux", "c++", "c#", "ruby", "go", "rust",
  "swift", "kotlin", "php", "spring", "graphql", "redis", "firebase",
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
  "numpy", "scikit-learn", "data science", "figma", "photoshop"
];

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILLS_DB.filter(skill => lower.includes(skill));
}

export interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  matchScore?: number;
}
