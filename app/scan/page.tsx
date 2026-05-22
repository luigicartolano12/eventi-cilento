import { ScanLocandina } from "./ScanLocandina";

export const metadata = {
  title: "Scansiona locandina — Eventi Cilento",
  description: "Carica la foto di una locandina e l'AI estrae automaticamente tutti i dati dell'evento.",
};

export default function ScanPage() {
  return <ScanLocandina />;
}
