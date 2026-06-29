/**
 * StudyFlow AI – IdeaLab Domain Mock Data
 * Isolated default braindump steps and IdeaLab question templates.
 */

export const DEFAULT_BRAINDUMP_STEPS = [
  'Research & Outline Core Requirement Specs',
  'Draft System Architecture & Database Schema',
  'Implement Primary Modules & API Endpoints',
  'Final Testing, Bug Fixes & Project Submission'
];

export const IDEALAB_QUESTIONS_MOCK = [
  "",
  { titleHtml: 'What are you trying to <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">accomplish?</span>', sub: "Define the core project or exam objective in one clear sentence.", ph: "e.g. Build a DBMS Mini Project", key: "title" },
  { titleHtml: 'Why is this <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">important</span> to you?', sub: "Identify your motivation, target grade, or GPA impact.", ph: "e.g. I need 40/40 internal marks to boost my semester GPA...", key: "why" },
  { titleHtml: 'What is your target <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">deadline?</span>', sub: "When is final submission or exam day? How many days left?", ph: "e.g. 10 days left (or July 15th)...", key: "deadline" },
  { titleHtml: 'Brain dump all rough <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">milestones</span>', sub: "List out chapters, components, or rough deliverables. AI will break this down.", ph: "- ER Schema Design\n- REST API endpoint setup\n- Write final report...", key: "braindump" },
  { titleHtml: 'How much daily <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">study time</span> do you have?', sub: "Be realistic about Pomodoro blocks and daily deep work sessions.", ph: "e.g. 2 hours every evening (~4 Pomodoros daily)...", key: "time" },
  { titleHtml: 'What <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">resources & docs</span> do you need?', sub: "Paste links, lecture slides, or reference books you will use.", ph: "e.g. MongoDB aggregation cheat sheet, Express docs...", key: "resources" },
  { titleHtml: 'What potential <span class="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">obstacles</span> do you foresee?', sub: "What could slow you down or cause procrastination?", ph: "e.g. Unfamiliar with authentication middleware or exam stress...", key: "obstacles" }
];
