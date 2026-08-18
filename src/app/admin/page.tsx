import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Jewelry } from "@/lib/types";
import CatalogFilters from "../CatalogFilters";
import DeleteButton from "./DeleteButton";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function AdminPage({
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

  const { data: jewelry } = await query.returns<Jewelry[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">
          Jóias cadastradas
        </h1>
        <Link
          href="/admin/nova"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-soft"
        >
          + Nova joia
        </Link>
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <CatalogFilters basePath="/admin" />
        </Suspense>
      </div>

      {jewelry && jewelry.length === 0 && (
        <p className="py-16 text-center text-muted">
          {hasFilters
            ? "Nenhuma joia encontrada com esses filtros."
            : "Nenhuma joia cadastrada ainda."}
        </p>
      )}

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {jewelry?.map((item) => {
          const isBelowCost =
            item.cost_price != null && item.price < item.cost_price;

          return (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 sm:p-5"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/5">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.code}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted">
                  Sem foto
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">


              <p
                className={`truncate font-medium ${
                  isBelowCost ? "text-red-600" : "text-foreground"
                }`}
              >
                {item.code}
                {item.description ? ` - ${item.description}` : ""}
              </p>

              
              <p className="text-xs uppercase tracking-wider text-gold-soft">
                Categoria: {item.category}
              </p>
              <p
                className={`text-sm ${
                  isBelowCost ? "text-red-600" : "text-muted"
                }`}
              >
                Preço de Venda: {currency.format(item.price)}
              </p>
              <p className="text-xs text-muted/70">
                Preço de Custo:{" "}
                {item.cost_price != null
                  ? currency.format(item.cost_price)
                  : "—"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/admin/editar/${item.id}`}
                className="text-sm text-gold transition hover:text-gold-soft"
              >
                Editar
              </Link>
              <DeleteButton id={item.id} code={item.code} />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
