"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ToggleAtivoButton({ id, ativo }: { id: string; ativo: boolean }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(ativo);

  const toggle = async () => {
    setLoading(true);
    const newValue = !active;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("empreendimentos") as any)
      .update({ ativo: newValue })
      .eq("id", id);

    if (!error) {
      setActive(newValue);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        border: "none",
        backgroundColor: active ? "#6b9f6b" : "rgba(255,255,255,0.1)",
        cursor: loading ? "default" : "pointer",
        position: "relative",
        transition: "background-color 0.2s",
        opacity: loading ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: active ? "21px" : "3px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}
