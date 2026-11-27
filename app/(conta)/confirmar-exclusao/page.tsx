import type { Metadata } from "next";
import ConfirmarOperacao from "../confirmar-operacao";

export const metadata: Metadata = { title: "Confirmar exclusão", referrer: "no-referrer", robots: { index: false } };

export default function ConfirmarExclusaoPage() {
  return <ConfirmarOperacao exclusao />;
}
