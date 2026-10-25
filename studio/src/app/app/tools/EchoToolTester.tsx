"use client";

import { useState } from "react";

export function EchoToolTester() {
  const [message, setMessage] = useState("Hello from XSW Tools!");
  const [forceFail, setForceFail] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runEcho = async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "echo",
          inputs: { message, forceFail },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to trigger echo job");
        return;
      }

      const jobId = data.job?.id;
      // Poll job status until complete
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();

        if (jobData.status === "succeeded" || jobData.status === "failed") {
          setResult(jobData);
          setRunning(false);
        } else if (attempts < 20) {
          setTimeout(poll, 1000);
        } else {
          setResult(jobData);
          setRunning(false);
        }
      };
      setTimeout(poll, 800);
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setRunning(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
      <div className="text-xs font-semibold uppercase text-indigo-400">
        Live Pipeline Test Runner
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-slate-400">Message payload:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="forceFail"
          checked={forceFail}
          onChange={(e) => setForceFail(e.target.checked)}
          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
        />
        <label htmlFor="forceFail" className="text-xs text-slate-300">
          Force failure (test quota reservation release)
        </label>
      </div>

      <button
        onClick={runEcho}
        disabled={running}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded text-white transition disabled:opacity-50"
      >
        {running ? "Processing Job..." : "Execute Echo Pipeline"}
      </button>

      {error && (
        <div className="p-2 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">Status:</span>
            <span
              className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                result.status === "succeeded"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-red-950 text-red-400 border border-red-800"
              }`}
            >
              {result.status}
            </span>
          </div>

          {result.errorCode && (
            <div className="text-red-400">Error Code: {result.errorCode}</div>
          )}

          {result.outputs && result.outputs.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-slate-400">Outputs (Signed Download URLs):</span>
              {result.outputs.map((out: any) => (
                <div key={out.fileId} className="flex items-center justify-between">
                  <span className="text-slate-300 truncate">{out.name}</span>
                  <a
                    href={out.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-indigo-400 hover:underline"
                  >
                    Download (5m expiry)
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
