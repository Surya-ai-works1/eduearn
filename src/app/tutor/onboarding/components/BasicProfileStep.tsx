"use client";
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';

export default function BasicProfileStep() {
  const { state, setState, goNext } = useOnboarding();
  const { personalInfo } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev: OnboardingState) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Basic Profile</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          goNext();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={personalInfo.fullName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="displayName">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={personalInfo.displayName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        {/* Add other fields similarly – omitted for brevity */}
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
