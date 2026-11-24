import type { Metadata } from "next";
import { ConfirmarEmail } from "./confirmar-email";

export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false } };

export default function ConfirmarEmailPage() {
  return <ConfirmarEmail />;
}
