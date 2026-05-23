import Link from 'next/link';
import { LayoutDashboard, Users, Plug, Settings, Activity, StickyNote } from 'lucide-react';
import type { Workspace, User } from '@pcs/db';
import { initials } from '@/lib/format';

export function Sidebar({ workspace, user }: { workspace: Workspace; user: User }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-ink-200 bg-white md:flex">
      {/* Workspace */}
      <div className="border-b border-ink-200 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-xs font-semibold text-white">
            {initials(workspace.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{workspace.name}</p>
            <p className="truncate text-[11px] text-ink-500">/{workspace.slug}</p>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={15} />} label="Problems" />
        <NavItem href="/clients" icon={<Users size={15} />} label="Clients" />
        <NavItem href="/notes" icon={<StickyNote size={15} />} label="Manual notes" />
        <NavItem href="/activity" icon={<Activity size={15} />} label="Activity" />

        <div className="pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          Setup
        </div>
        <NavItem href="/connectors" icon={<Plug size={15} />} label="Connectors" />
        <NavItem href="/settings" icon={<Settings size={15} />} label="Settings" />
      </nav>

      {/* User */}
      <div className="border-t border-ink-200 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            {initials(user.name ?? user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink-900">{user.name ?? 'You'}</p>
            <p className="truncate text-[11px] text-ink-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    >
      <span className="text-ink-500 group-hover:text-ink-700">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
