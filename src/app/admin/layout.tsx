import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/admin"
            className="font-serif text-xl tracking-wide text-gold-soft"
          >
            Administração
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted transition hover:text-gold">
              Ver catálogo
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
        {children}
      </main>
    </div>
  );
}
