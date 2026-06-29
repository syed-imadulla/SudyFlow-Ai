/**
 * StudyFlow AI – User Domain Mock Data
 * Isolated default profile and app settings templates.
 */

export const DEFAULT_PROFILE = {
  name:   'Imadulla',
  email:  'imadulla@university.edu',
  avatar: 'https://ui-avatars.com/api/?name=Imadulla&background=A855F7&color=fff&rounded=true',
  plan:   'Student Plan'
};

export const DEFAULT_SETTINGS = {
  name:    'Imadulla',
  email:   'imadulla@university.edu',
  avatar:  'https://ui-avatars.com/api/?name=Imadulla&background=A855F7&color=fff&rounded=true',
  focus:   window.SF_CONFIG?.POMODORO_DEFAULTS?.focus       ?? 25,
  short:   window.SF_CONFIG?.POMODORO_DEFAULTS?.shortBreak  ?? 5,
  long:    window.SF_CONFIG?.POMODORO_DEFAULTS?.longBreak   ?? 15,
  persona: 'Direct & Analytical'
};
