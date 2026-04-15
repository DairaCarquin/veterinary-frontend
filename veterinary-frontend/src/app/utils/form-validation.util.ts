export const MASTERDOG_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@masterdog\.com$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,120}$/;
export const DNI_REGEX = /^\d{8}$/;
export const PHONE_REGEX = /^\d{9}$/;
export const NAME_REGEX = /^[A-Za-zÀ-ÿ\s'-]{1,100}$/;

export function sanitizeDigits(value: string, maxLength: number): string {
  return (value || '').replace(/\D/g, '').slice(0, maxLength);
}

export function sanitizeLetters(value: string): string {
  return (value || '').replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
}

export function normalizeEmail(value: string): string {
  return (value || '').trim().toLowerCase();
}

export function isMasterdogEmail(value: string): boolean {
  return MASTERDOG_EMAIL_REGEX.test(normalizeEmail(value));
}

export function isStrongPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value || '');
}

export function hasMinPasswordLength(value: string): boolean {
  return (value || '').length >= 8;
}

export function hasUppercase(value: string): boolean {
  return /[A-Z]/.test(value || '');
}

export function hasNumber(value: string): boolean {
  return /\d/.test(value || '');
}

export function hasSpecialCharacter(value: string): boolean {
  return /[^A-Za-z0-9]/.test(value || '');
}

export function isValidDni(value: string): boolean {
  return DNI_REGEX.test((value || '').trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test((value || '').trim());
}

export function isValidName(value: string): boolean {
  return NAME_REGEX.test((value || '').trim());
}

export function hasWhitespace(value: string): boolean {
  return /\s/.test(value || '');
}

export function hasDigits(value: string): boolean {
  return /\d/.test(value || '');
}

export function hasLetters(value: string): boolean {
  return /[A-Za-zÀ-ÿ]/.test(value || '');
}

export function hasInvalidNameCharacters(value: string): boolean {
  return /[^A-Za-zÀ-ÿ\s'-]/.test(value || '');
}

export function hasSpecialCharacters(value: string): boolean {
  return /[^A-Za-z0-9\s]/.test(value || '');
}
