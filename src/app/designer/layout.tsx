import { DesignerPortalGate } from "@/components/consultation/designer-portal-gate";

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return <DesignerPortalGate>{children}</DesignerPortalGate>;
}
