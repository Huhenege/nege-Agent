export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">403</h1>
        <p className="mt-4 text-lg text-gray-400">Access Denied</p>
        <p className="mt-2 text-sm text-gray-500">
          You don&apos;t have permission to access this page.
        </p>
        <a
          href="/login"
          className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
}
