export type Jewelry = {
  id: string;
  code: string;
  category: string;
  material: string | null;
  description: string | null;
  supplier: string | null;
  price: number;
  cost_price: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export const JEWELRY_CATEGORIES = [
  "Anel",
  "Colar",
  "Pulseira",
  "Brinco",
  "Pingente",
  "Broche",
  "Relógio",
  "Outro",
] as const;
