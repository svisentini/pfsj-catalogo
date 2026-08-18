"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { JEWELRY_CATEGORIES, type Jewelry } from "@/lib/types";

function formatDecimal(value: string): string {
  const parsed = Number(value.replace(",", "."));
  if (value.trim() === "" || Number.isNaN(parsed)) return value;
  return parsed.toFixed(2).replace(".", ",");
}

export default function JewelryForm({
  initialData,
}: {
  initialData?: Jewelry;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [code, setCode] = useState(initialData?.code ?? "");
  const [category, setCategory] = useState(
    initialData?.category ?? JEWELRY_CATEGORIES[0]
  );
  const [material, setMaterial] = useState(initialData?.material ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [supplier, setSupplier] = useState(initialData?.supplier ?? "");
  const [price, setPrice] = useState(
    initialData ? formatDecimal(String(initialData.price)) : ""
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.cost_price != null
      ? formatDecimal(String(initialData.cost_price))
      : ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedPriceValue = Number(price.replace(",", "."));
  const parsedCostPriceValue = costPrice.trim()
    ? Number(costPrice.replace(",", "."))
    : null;
  const isPriceBelowCost =
    parsedCostPriceValue != null &&
    !Number.isNaN(parsedPriceValue) &&
    !Number.isNaN(parsedCostPriceValue) &&
    parsedPriceValue < parsedCostPriceValue;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(price.replace(",", "."));
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Informe um preço válido.");
      return;
    }

    let parsedCostPrice: number | null = null;
    if (costPrice.trim()) {
      parsedCostPrice = Number(costPrice.replace(",", "."));
      if (Number.isNaN(parsedCostPrice) || parsedCostPrice < 0) {
        setError("Informe um preço de custo válido.");
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();
    let imageUrl = initialData?.image_url ?? null;

    if (imageFile) {
      const extension = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("jewelry-images")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setSaving(false);
        setError("Não foi possível enviar a imagem. Tente novamente.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("jewelry-images")
        .getPublicUrl(path);

      imageUrl = publicUrlData.publicUrl;
    }

    const payload = {
      code,
      category,
      material: material || null,
      description: description || null,
      supplier: supplier || null,
      price: parsedPrice,
      cost_price: parsedCostPrice,
      image_url: imageUrl,
    };

    const { error: saveError } = isEditing
      ? await supabase.from("jewelry").update(payload).eq("id", initialData!.id)
      : await supabase.from("jewelry").insert(payload);

    setSaving(false);

    if (saveError) {
      setError("Não foi possível salvar a joia. Tente novamente.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm text-muted">
              Código
            </label>
            <input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: AN001"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-muted">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm text-muted">
              Categoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            >
              {JEWELRY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm text-muted">
              Fornecedor
            </label>
            <input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm text-muted">
              Preço de Venda (R$)
            </label>
            <input
              id="price"
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => setPrice((current) => formatDecimal(current))}
              placeholder="0,00"
              className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none ${
                isPriceBelowCost
                  ? "border-red-500 text-red-600 focus:border-red-500"
                  : "border-border text-foreground focus:border-gold"
              }`}
            />
            {isPriceBelowCost && (
              <p className="mt-1 text-xs text-red-600">
                Preço de venda menor que o preço de custo.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="costPrice" className="block text-sm text-muted">
              Preço de custo (R$)
            </label>
            <input
              id="costPrice"
              inputMode="decimal"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              onBlur={() => setCostPrice((current) => formatDecimal(current))}
              placeholder="0,00"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="material" className="block text-sm text-muted">
              Material
            </label>
            <input
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Ex: Ouro 18k, Prata, Platina"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-gold"
            />
          </div>


        </div>

        <div>
          <label htmlFor="image" className="block text-sm text-muted">
            Foto da joia
          </label>
          <div className="mt-1 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-black/5">
            {imagePreview ? (
              <div className="relative h-full w-full">
                <Image
                  src={imagePreview}
                  alt="Pré-visualização"
                  fill
                  className="object-cover"
                  unoptimized={imagePreview.startsWith("blob:")}
                />
              </div>
            ) : (
              <span className="text-sm text-muted">Nenhuma imagem</span>
            )}
          </div>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-3 w-full text-sm text-muted"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gold px-5 py-2 font-medium text-white transition hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-border px-5 py-2 text-foreground transition hover:border-gold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
