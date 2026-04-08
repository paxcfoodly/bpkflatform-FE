'use client';

import { useEffect, useState } from 'react';
import apiClient, { type HealthData } from '@/lib/api-client';

interface StatusInfo {
  fe: { status: string; version: string };
  be: { status: string; version: string; environment: string } | null;
  cors: boolean;
  latencyMs: number | null;
  error: string | null;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusInfo>({
    fe: { status: 'ok', version: '1.0.0' },
    be: null,
    cors: false,
    latencyMs: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      const start = Date.now();
      try {
        const res = await apiClient.getHealth();
        const latency = Date.now() - start;

        if (res.success && res.data) {
          setStatus({
            fe: { status: 'ok', version: '1.0.0' },
            be: res.data,
            cors: true,
            latencyMs: latency,
            error: null,
          });
        } else {
          setStatus((prev) => ({
            ...prev,
            cors: false,
            latencyMs: latency,
            error: res.error?.message || 'Backend unreachable',
          }));
        }
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          cors: false,
          latencyMs: Date.now() - start,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">BPK Hub — System Status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Infrastructure health check
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Frontend Status */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Frontend (Next.js)</span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              ✅ Running
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">v{status.fe.version}</p>
        </div>

        {/* Backend Status */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Backend (FastAPI)</span>
            {loading ? (
              <span className="text-xs text-muted-foreground">Checking...</span>
            ) : status.be ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                ✅ {status.be.status}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                ❌ Unreachable
              </span>
            )}
          </div>
          {status.be && (
            <p className="mt-1 text-xs text-muted-foreground">
              v{status.be.version} · {status.be.environment}
            </p>
          )}
          {status.error && (
            <p className="mt-1 text-xs text-red-500">{status.error}</p>
          )}
        </div>

        {/* CORS Status */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">CORS (FE→BE)</span>
            {loading ? (
              <span className="text-xs text-muted-foreground">Checking...</span>
            ) : status.cors ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                ✅ Allowed
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                ⚠️ Blocked
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            API: {apiUrl}
          </p>
        </div>

        {/* Latency */}
        {status.latencyMs !== null && (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">API Latency</span>
              <span className="text-sm font-mono">
                {status.latencyMs}ms
              </span>
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Checked at {new Date().toLocaleString('ko-KR')}
        </p>
      )}
    </main>
  );
}
