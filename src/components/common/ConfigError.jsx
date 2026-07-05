import { missingFirebaseKeys } from "../../firebase";

export default function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card max-w-lg w-full">
        <h1 className="font-display font-bold text-xl text-lotus mb-2">
          Firebase isn't configured
        </h1>
        <p className="text-ink/70 text-sm mb-3">
          Finma can't start because one or more Firebase environment variables are missing from
          this build. This is the most common cause of a blank white screen after deploying.
        </p>
        <p className="text-ink/70 text-sm mb-2">Missing:</p>
        <ul className="text-sm text-lotus mb-4 list-disc list-inside">
          {missingFirebaseKeys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
        <p className="text-ink/60 text-xs">
          Locally: add these to <code className="bg-indigo-50 px-1 rounded">.env.local</code>{" "}
          (see <code className="bg-indigo-50 px-1 rounded">.env.example</code>).<br />
          On GitHub Actions: add them as Repository Secrets with names starting with{" "}
          <code className="bg-indigo-50 px-1 rounded">VITE_FIREBASE_</code>, matching{" "}
          <code className="bg-indigo-50 px-1 rounded">.github/workflows/deploy.yml</code>.
        </p>
      </div>
    </div>
  );
}
