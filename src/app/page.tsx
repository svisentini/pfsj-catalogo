import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Jewelry } from "@/lib/types";
import CatalogFilters from "./CatalogFilters";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    code?: string;
    description?: string;
  }>;
}) {
  const filters = await searchParams;
  const hasFilters = Boolean(
    filters.category || filters.code || filters.description
  );

  const supabase = await createClient();
  let query = supabase
    .from("jewelry")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.code) query = query.ilike("code", `%${filters.code}%`);
  if (filters.description)
    query = query.ilike("description", `%${filters.description}%`);

  const { data: jewelry, error } = await query.returns<Jewelry[]>();

  if (error) {
    console.error("Erro ao buscar joias no Supabase:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <h1 className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 sm:h-16 sm:w-16">
              <Image
                src="/logo-pf.jpg"
                alt="Paula Fernandes Semijoias"
                width={200}
                height={200}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <span className="font-serif text-xl tracking-wide text-gold-soft sm:text-2xl">
              Paula Fernandes Semijoias
            </span>
          </h1>
          <Link
            href="/login"
            className="text-sm text-muted transition hover:text-gold"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
        <Suspense fallback={null}>
          <CatalogFilters />
        </Suspense>

        {error && (
          <p className="text-sm text-red-500">
            Não foi possível carregar o catálogo agora. Tente novamente em
            instantes.
          </p>
        )}

        {!error && jewelry && jewelry.length === 0 && (
          <p className="py-20 text-center text-muted">
            {hasFilters
              ? "Nenhuma joia encontrada com esses filtros."
              : "Nenhuma joia cadastrada ainda."}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jewelry?.map((item) => (
            <article
              key={item.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg hover:shadow-gold/5"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-black/5">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.code}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    Sem foto
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-serif text-lg text-foreground">
                  {item.code}
                  {item.description ? ` - ${item.description}` : ""}
                </h2>
                <div className="mt-auto space-y-1 pt-3">
                  <p className="text-xs uppercase tracking-wider text-gold-soft">
                    {item.category}
                  </p>
                  <p className="text-lg font-medium text-gold">
                    {currency.format(item.price)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        Paula Fernandes Semijoias
      </footer>
    </div>
  );
}
