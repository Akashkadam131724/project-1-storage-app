const STORAGE_KEY = "storage-remember-email";

export function loadRememberedEmail() {
  const saved = localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  return saved || null;
}

export function saveRememberedEmail(email: string) {
  localStorage.setItem(STORAGE_KEY, email.trim());
}

export function clearRememberedEmail() {
  localStorage.removeItem(STORAGE_KEY);
}

export function persistRememberedEmail(email: string, remember: boolean) {
  if (remember) {
    saveRememberedEmail(email);
    return;
  }
  clearRememberedEmail();
}
