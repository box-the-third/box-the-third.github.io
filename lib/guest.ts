// "Continue without email": a guest browses the site for this tab/session only,
// so every new visit (and every sign-out) starts at the welcome gate again.
const KEY = "yas:guest";

export const isGuest = (): boolean => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const setGuest = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
