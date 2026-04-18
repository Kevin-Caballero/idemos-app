import type { Initiative } from "@/hooks/use-feed";

export const mockInitiative: Initiative = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  source: "congreso",
  legislature: "XV",
  type: "Proyecto",
  expediente: "121/000001",
  title: "Proyecto de Ley de Presupuestos Generales del Estado para 2026",
  author: "Gobierno",
  procedureType: "Proyecto de Ley",
  currentStatus: "En tramitación en Comisión",
  committee: "Comisión de Hacienda",
  presentedAt: "2026-01-15T00:00:00.000Z",
  qualifiedAt: "2026-01-20T00:00:00.000Z",
  closedAt: null,
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
};

export const mockProposicion: Initiative = {
  ...mockInitiative,
  id: "550e8400-e29b-41d4-a716-446655440001",
  type: "Proposicion",
  expediente: "122/000042",
  title: "Proposición de Ley sobre transparencia en la acción pública",
  author: "Grupo Parlamentario Socialista",
  currentStatus: "Aprobada definitivamente",
  committee: null,
  closedAt: "2026-03-10T00:00:00.000Z",
};

export const mockRejectedInitiative: Initiative = {
  ...mockInitiative,
  id: "550e8400-e29b-41d4-a716-446655440002",
  currentStatus: "Rechazada en Pleno",
  closedAt: "2026-02-28T00:00:00.000Z",
};
