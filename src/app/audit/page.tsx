import { AuditLogViewer } from '../../../components/audit/AuditLogViewer';

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">TracAgent Self-Audit Log</h1>
        <AuditLogViewer />
      </div>
    </main>
  );
} 