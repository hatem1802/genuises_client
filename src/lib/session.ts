export type SessionEndReason = "expired" | "unapproved";

type SessionEndHandler = (reason: SessionEndReason) => void;

let handler: SessionEndHandler | null = null;
let ending = false;

export function setSessionEndHandler(next: SessionEndHandler | null) {
  handler = next;
}

export function endSession(reason: SessionEndReason) {
  if (ending) return;
  ending = true;
  handler?.(reason);
  window.setTimeout(() => {
    ending = false;
  }, 1000);
}
