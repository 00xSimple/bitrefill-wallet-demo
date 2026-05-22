import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-display-lg text-[var(--foreground)]">404</h1>
      <p className="text-body-lg text-[var(--muted-foreground)] mt-4">
        页面未找到
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 text-sm font-semibold shadow-[var(--shadow-cta-sm)] hover:brightness-110 transition-all"
      >
        返回首页
      </Link>
    </div>
  );
}
