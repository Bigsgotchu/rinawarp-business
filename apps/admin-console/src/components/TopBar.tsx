import { useAdmin } from '../lib/adminContext';

export function TopBar() {
  const { apiToken } = useAdmin();
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RinaWarp Platform</h1>
        <p className="text-sm text-neutral-400">
          Internal admin console — analytics, licenses, and system health.
        </p>
      </div>
      <div className="text-xs text-neutral-400">
        API Token:{' '}
        <span
          className={
            'inline-flex items-center px-2 py-1 rounded-full border ' +
            (apiToken ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400')
          }
        >
          {apiToken ? 'Configured' : 'Not set'}
        </span>
      </div>
    </header>
  );
}
