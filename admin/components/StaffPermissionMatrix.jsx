"use client";

import {
  STAFF_PERMISSION_MODULES,
  STAFF_PERMISSION_ACTIONS,
} from "../lib/staffPermissions";

// ✅ প্রতিটা module (Orders, Products, ...) এর সারিতে View/Add/Edit/Delete
// এর চেকবক্স — Staff Add ও Access মডাল দুই জায়গাতেই ব্যবহার হয়।
export default function StaffPermissionMatrix({ value, onChange }) {
  const toggleAction = (moduleKey, actionKey) => {
    const current = value[moduleKey] || {};
    onChange({
      ...value,
      [moduleKey]: { ...current, [actionKey]: !current[actionKey] },
    });
  };

  const toggleModule = (moduleKey, checked) => {
    onChange({
      ...value,
      [moduleKey]: Object.fromEntries(
        STAFF_PERMISSION_ACTIONS.map(({ key }) => [key, checked]),
      ),
    });
  };

  return (
    <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
      <table className="w-full text-sm min-w-[420px]">
        <thead className="bg-gray-100 dark:bg-slate-800">
          <tr>
            <th className="p-2 text-left text-gray-700 dark:text-slate-300">সেকশন</th>
            {STAFF_PERMISSION_ACTIONS.map((a) => (
              <th key={a.key} className="p-2 text-center text-gray-700 dark:text-slate-300">
                {a.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STAFF_PERMISSION_MODULES.map((m) => {
            const modulePerms = value[m.key] || {};
            const allChecked = STAFF_PERMISSION_ACTIONS.every(
              (a) => modulePerms[a.key],
            );

            return (
              <tr key={m.key} className="border-t dark:border-slate-700">
                <td className="p-2 font-medium text-gray-900 dark:text-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(e) => toggleModule(m.key, e.target.checked)}
                    />
                    {m.label}
                  </label>
                </td>
                {STAFF_PERMISSION_ACTIONS.map((a) => (
                  <td key={a.key} className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!modulePerms[a.key]}
                      onChange={() => toggleAction(m.key, a.key)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
