"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteButton({
  id,
  code,
}: {
  id: string;
  code: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Excluir "${code}" do catálogo?`);
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from("jewelry").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 transition hover:text-red-400 disabled:opacity-60"
    >
      {loading ? "Excluindo..." : "Excluir"}
    </button>
  );
}
