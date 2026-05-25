import crypto from "crypto";
import { z } from "zod";

const gudokCallSchema = z.object({
  eventId: z.string(),
  companyId: z.string(),
  direction: z.enum(["inbound", "outbound"]),
  status: z.enum(["answered", "missed", "busy", "failed"]),
  clientPhone: z.string(),
  managerPhone: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  durationSec: z.number().optional(),
  source: z.string().optional(),
  occurredAt: z.string().datetime()
});

type PrismaLike = {
  webhook: { create(args: unknown): Promise<unknown> };
  contact: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
    create(args: unknown): Promise<{ id: string }>;
  };
  deal: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
    create(args: unknown): Promise<{ id: string }>;
  };
  callLog: { create(args: unknown): Promise<unknown> };
  task: { create(args: unknown): Promise<unknown> };
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
}

export function verifyGudokSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function handleGudokWebhook(prisma: PrismaLike, payload: unknown) {
  const event = gudokCallSchema.parse(payload);
  const phone = normalizePhone(event.clientPhone);

  await prisma.webhook.create({
    data: {
      companyId: event.companyId,
      source: "gudok",
      eventType: "call",
      idempotencyKey: event.eventId,
      payload: event
    }
  });

  const contact =
    (await prisma.contact.findFirst({
      where: { companyId: event.companyId, phone },
      select: { id: true }
    })) ||
    (await prisma.contact.create({
      data: {
        companyId: event.companyId,
        name: `Клиент ${phone}`,
        phone,
        source: event.source || "gudok",
        lastContactAt: new Date(event.occurredAt)
      },
      select: { id: true }
    }));

  const activeDeal =
    (await prisma.deal.findFirst({
      where: {
        companyId: event.companyId,
        contactId: contact.id,
        status: "OPEN"
      },
      orderBy: { createdAt: "desc" },
      select: { id: true }
    })) ||
    (await prisma.deal.create({
      data: {
        companyId: event.companyId,
        contactId: contact.id,
        pipelineId: "default-pipeline-id",
        stageId: "new-lead-stage-id",
        title: "Звонок из Гудок",
        source: event.source || "gudok"
      },
      select: { id: true }
    }));

  await prisma.callLog.create({
    data: {
      companyId: event.companyId,
      contactId: contact.id,
      dealId: activeDeal.id,
      provider: "gudok",
      providerCallId: event.eventId,
      direction: event.direction.toUpperCase(),
      status: event.status.toUpperCase(),
      phone,
      managerPhone: event.managerPhone,
      recordingUrl: event.recordingUrl,
      source: event.source,
      occurredAt: new Date(event.occurredAt),
      durationSec: event.durationSec,
      rawPayload: event
    }
  });

  if (event.status === "missed") {
    await prisma.task.create({
      data: {
        companyId: event.companyId,
        dealId: activeDeal.id,
        contactId: contact.id,
        title: "Перезвонить клиенту",
        dueAt: new Date(Date.now() + 15 * 60 * 1000),
        priority: "URGENT"
      }
    });
  }

  return { contactId: contact.id, dealId: activeDeal.id };
}
