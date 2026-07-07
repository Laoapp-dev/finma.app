import { useState } from "react";
import { missingFirebaseKeys } from "../../firebase";

/**
 * Non-blocking version of ConfigError. The free tools (Fixed Deposit,
 * Compound Interest, Knowledge) and every page's read-only preview work
 * fine without Firebase — only signing in and saving data need it — so a
 * missing config shouldn't take over the whole screen. This is a slim,
 * dismissible-for-the-session banner instead, with the same diagnostic
 * detail available on demand via "Details".
 */
export default function ConfigBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-lotus-50 border-b border-lotus/20 text-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-start gap-3">
        <span className="text-lotus shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-ink/80">
            <span className="font-medium text-lotus">Firebase isn't configured.</span>{" "}
            Sign-in and saved data are unavailable, but every free tool below still works.{" "}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="underline font-medium text-ink/70 hover:text-ink"
            >
              {expanded ? "Hide details" : "Details"}
            </button>
          </p>
          {expanded && (
            <div className="mt-2 text-xs text-ink/60">
              <p className="mb-1">Missing: {missingFirebaseKeys.join(", ")}</p>
              <p>
                Locally: add these to <code className="bg-white/60 px-1 rounded">.env.local</code>{" "}
                (see <code className="bg-white/60 px-1 rounded">.env.example</code>). On GitHub
                Actions: add them as Repository Secrets with names starting with{" "}
                <code className="bg-white/60 px-1 rounded">VITE_FIREBASE_</code>, matching{" "}
                <code className="bg-white/60 px-1 rounded">.github/workflows/deploy.yml</code>.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-ink/40 hover:text-ink/70 shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
