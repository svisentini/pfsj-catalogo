import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Jewelry } from "@/lib/types";
import JewelryForm from "../../JewelryForm";

export default async function EditarJoiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("jewelry")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const jewelry = data as Jewelry | null;

  if (!jewelry) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Editar joia</h1>
      <div className="mt-8">
        <JewelryForm initialData={jewelry} />
      </div>
    </div>
  );
}
