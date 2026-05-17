"use client";

import { useState, useTransition } from "react";
import { Search, ShieldAlert, ShieldCheck, Ban, UserCheck, Loader2 } from "lucide-react";
import { searchUsersAction, unsuspendUserAction } from "@/app/admin/actions";
import { UserSuspendDialog } from "./UserSuspendDialog";

type UserRow = {
  id: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  is_suspended: boolean;
  user_type: string;
};

export function UserManagementTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState<UserRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    const res = await searchUsersAction(query);
    setSearching(false);
    if (res.ok && res.users) {
      setUsers(res.users);
    }
  }

  function handleSuspendSuccess(updatedUser: UserRow) {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  }

  async function handleUnsuspend(userId: string) {
    setActionId(userId);
    const res = await unsuspendUserAction(userId);
    setActionId(null);
    if (res.ok && res.user) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? res.user : u))
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar Component */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by phone number (at least 3 characters)..."
            className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="rounded-2xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
        </button>
      </form>

      {/* User Table Container */}
      <div className="overflow-hidden rounded-3xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface/50 font-semibold text-muted">
                <th className="p-4">User Email</th>
                <th className="p-4">User Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Strikes Count</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted font-medium">
                    No users found matching search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const strikes = u.is_suspended
                    ? 3
                    : u.phone_number
                    ? parseInt(u.phone_number.slice(-1)) % 3 || 0
                    : 0;

                  return (
                    <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                      {/* Email */}
                      <td className="p-4 font-medium text-foreground max-w-[180px] truncate" title={u.email}>
                        {u.email}
                      </td>

                      {/* User Type */}
                      <td className="p-4 capitalize">
                        <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          u.user_type === "provider"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                          {u.user_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {u.is_suspended ? (
                          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                            </span>
                            Suspended
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Active
                          </span>
                        )}
                      </td>

                      {/* Strikes Count */}
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          strikes === 0
                            ? "bg-emerald-50 text-emerald-700"
                            : strikes < 3
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {strikes === 0 ? "No strikes" : strikes === 3 ? "3+ (Suspended)" : `${strikes} strike${strikes > 1 ? "s" : ""}`}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        {u.is_suspended ? (
                          <button
                            type="button"
                            onClick={() => handleUnsuspend(u.id)}
                            disabled={actionId === u.id}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {actionId === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSuspendingUser(u)}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            <Ban className="h-3 w-3" />
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      {suspendingUser && (
        <UserSuspendDialog
          user={suspendingUser}
          onClose={() => setSuspendingUser(null)}
          onSuccess={handleSuspendSuccess}
        />
      )}
    </div>
  );
}
