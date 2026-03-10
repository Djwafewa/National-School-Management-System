import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique student number in format: NSMS-YYYY-XXXXX
 */
export function generateStudentNumber(): string {
  const year = new Date().getFullYear();
  const unique = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `NSMS-${year}-${unique}`;
}

/**
 * Generate a receipt number in format: RCP-YYYYMMDD-XXXXX
 */
export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const unique = uuidv4().replace(/-/g, '').substring(0, 5).toUpperCase();
  return `RCP-${dateStr}-${unique}`;
}

/**
 * Calculate letter grade from percentage marks (PNG grading system)
 */
export function calculateGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 85) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 55) return 'C';
  if (percentage >= 40) return 'D';
  return 'E';
}

/**
 * PNG provinces list
 */
export const PNG_PROVINCES = [
  { code: 'NCD', name: 'National Capital District', region: 'Southern' },
  { code: 'CEN', name: 'Central Province', region: 'Southern' },
  { code: 'GUL', name: 'Gulf Province', region: 'Southern' },
  { code: 'MBP', name: 'Milne Bay Province', region: 'Southern' },
  { code: 'NIP', name: 'Northern (Oro) Province', region: 'Southern' },
  { code: 'WES', name: 'Western Province', region: 'Southern' },
  { code: 'EHP', name: 'Eastern Highlands Province', region: 'Highlands' },
  { code: 'SHP', name: 'Southern Highlands Province', region: 'Highlands' },
  { code: 'WHP', name: 'Western Highlands Province', region: 'Highlands' },
  { code: 'SIM', name: 'Simbu (Chimbu) Province', region: 'Highlands' },
  { code: 'ENG', name: 'Enga Province', region: 'Highlands' },
  { code: 'JIW', name: 'Jiwaka Province', region: 'Highlands' },
  { code: 'HEL', name: 'Hela Province', region: 'Highlands' },
  { code: 'MAD', name: 'Madang Province', region: 'Momase' },
  { code: 'MOR', name: 'Morobe Province', region: 'Momase' },
  { code: 'ESP', name: 'East Sepik Province', region: 'Momase' },
  { code: 'WSP', name: 'West Sepik (Sandaun) Province', region: 'Momase' },
  { code: 'ENB', name: 'East New Britain Province', region: 'Islands' },
  { code: 'WNB', name: 'West New Britain Province', region: 'Islands' },
  { code: 'NIP2', name: 'New Ireland Province', region: 'Islands' },
  { code: 'MAN', name: 'Manus Province', region: 'Islands' },
  { code: 'BOU', name: 'Autonomous Region of Bougainville', region: 'Islands' },
];

/**
 * PNG church agencies operating schools
 */
export const CHURCH_AGENCIES = [
  'Catholic Church',
  'Evangelical Lutheran Church of PNG',
  'United Church in PNG',
  'Seventh-day Adventist Church',
  'Anglican Church of PNG',
  'Evangelical Brotherhood Church',
  'Gutnius Lutheran Church',
  'Baptist Union of PNG',
  'Salvation Army',
  'Assemblies of God',
  'Four Square Church',
  'Christian Brethren Church',
  'Other',
];
