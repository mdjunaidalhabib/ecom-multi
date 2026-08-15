"use client";

import { useEffect, useState } from "react";
import UsersSkeleton from "../../../../components/Skeleton/UsersSkeleton";
import Pagination from "../../../../components/Pagination";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users?page=${page}&limit=50`);
        const data = await res.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page]);

  return (
    <div className="p-3 sm:p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">👥 Users</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm shadow hover:scale-105 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* 🔹 Skeleton Loading */}
      {loading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-slate-400 py-10">No users found.</div>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">User ID</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">Name</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">Email</th>
                  <th className="p-3 text-left text-gray-700 dark:text-slate-300">Avatar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60">
                    <td className="p-3 font-mono text-xs text-gray-600 dark:text-slate-400">
                      {u.userId}
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-slate-100">{u.name}</td>
                    <td className="p-3 text-gray-700 dark:text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <img
                        src={u.avatar || `https://i.pravatar.cc/150?u=${u.email}`}
                        alt={u.name || "User Avatar"}
                        className="w-10 h-10 rounded-full border dark:border-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {users.map((u) => (
              <div
                key={u._id}
                className="border dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-3"
              >
                <img
                  src={u.avatar || `https://i.pravatar.cc/150?u=${u.email}`}
                  alt={u.name || "User Avatar"}
                  className="w-12 h-12 rounded-full border dark:border-slate-700"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-slate-200">{u.name}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 break-all">{u.email}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">ID: {u.userId}</div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
