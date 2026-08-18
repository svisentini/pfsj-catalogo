"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { JEWELRY_CATEGORIES } from "@/lib/types";

export default function CatalogFilters({
  basePath = "/",
}: {
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [description, setDescription] = useState(
    searchParams.get("description") ?? ""
  );

  const hasFilters = Boolean(category || code || description);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (code) params.set("code", code);
    if (description) params.set("description", description);
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
  }

  function clearFilters() {
    setCategory("");
    setCode("");
    setDescription("");
    router.push(basePath);
  }

  return (
    <form
      onSubmit={applyFilters}
      className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="filter-category" className="block text-xs text-muted">
          Categoria
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        >
          <option value="">Todas as categorias</option>
          {JEWELRY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="filter-code" className="block text-xs text-muted">
          Código
        </label>
        <input
          id="filter-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: AN001"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex-1">
        <label
          htmlFor="filter-description"
          className="block text-xs text-muted"
        >
          Descrição
        </label>
        <input
          id="filter-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Buscar na descrição"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-soft"
        >
          Filtrar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:border-gold"
          >
            Limpar
          </button>
        )}
      </div>
    </form>
  );
}
