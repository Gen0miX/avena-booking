import { createClient } from "@/utils/supabase/client";

export interface Status {
  id: number;
  name: string;
}

export async function getSatus(): Promise<Status[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("status").select("*");

  if (error) {
    console.error("Error fetching status:", error);
    return [];
  }

  return data as Status[];
}
