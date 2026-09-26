// src/lib/utils/meetingValidator.ts

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMeetingUrl(provider: string, meetingLink: string): ValidationResult {
  if (!meetingLink || typeof meetingLink !== 'string') {
    return { valid: false, error: 'Meeting link is required.' };
  }
  const trimmed = meetingLink.trim();

  let urlObj: URL;
  try {
    urlObj = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  if (urlObj.protocol !== 'https:') {
    return { valid: false, error: 'Meeting link must use secure HTTPS protocol.' };
  }

  const hostname = urlObj.hostname.toLowerCase();

  if (provider === 'google_meet') {
    if (hostname !== 'meet.google.com') {
      return { valid: false, error: 'Google Meet link must start with https://meet.google.com/' };
    }
  } else if (provider === 'zoom') {
    if (hostname !== 'zoom.us' && !hostname.endsWith('.zoom.us')) {
      return { valid: false, error: 'Zoom link must be a valid zoom.us domain (e.g. https://zoom.us/j/...)' };
    }
  } else {
    return { valid: false, error: 'Unsupported meeting provider. Allowed: google_meet, zoom' };
  }

  return { valid: true };
}
