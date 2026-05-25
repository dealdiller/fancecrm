import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useMemo } from "react";

type Stage = {
  id: string;
  name: string;
};

type Deal = {
  id: string;
  title: string;
  amount: number;
  stageId: string;
  fenceType: string;
  city?: string;
};

type Props = {
  stages: Stage[];
  deals: Deal[];
  onMoveDeal: (dealId: string, stageId: string) => Promise<void>;
  onOpenDeal: (dealId: string) => void;
};

export function DealKanbanExample({ stages, deals, onMoveDeal, onOpenDeal }: Props) {
  const dealsByStage = useMemo(() => {
    return stages.map((stage) => ({
      stage,
      deals: deals.filter((deal) => deal.stageId === stage.id)
    }));
  }, [stages, deals]);

  async function handleDragEnd(event: DragEndEvent) {
    const dealId = String(event.active.id);
    const stageId = event.over?.id ? String(event.over.id) : null;
    if (!stageId) return;
    await onMoveDeal(dealId, stageId);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid auto-cols-[280px] grid-flow-col gap-3 overflow-x-auto">
        {dealsByStage.map(({ stage, deals: stageDeals }) => (
          <section key={stage.id} className="rounded-lg border bg-muted/40 p-3" id={stage.id}>
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{stage.name}</h2>
              <span className="rounded-full bg-background px-2 py-1 text-xs">{stageDeals.length}</span>
            </header>
            <div className="space-y-2">
              {stageDeals.map((deal) => (
                <button
                  key={deal.id}
                  type="button"
                  className="w-full rounded-lg border bg-background p-3 text-left shadow-sm"
                  onClick={() => onOpenDeal(deal.id)}
                >
                  <strong className="block text-sm">{deal.title}</strong>
                  <span className="block text-xs text-muted-foreground">
                    {deal.fenceType}
                    {deal.city ? `, ${deal.city}` : ""}
                  </span>
                  <b className="mt-2 block">{new Intl.NumberFormat("ru-RU").format(deal.amount)} ₽</b>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DndContext>
  );
}
