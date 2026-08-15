export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900">
      <p className="text-gray-700 dark:text-slate-300 font-medium">একটি সেটিংস নির্বাচন করুন</p>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
        পাশের মেনু থেকে যেকোনো সেটিংসে ক্লিক করলে এখানে সেটি খুলবে।
      </p>
    </div>
  );
}
