import { z } from "zod";

const leadSchema = z.object({
  companyId: z.string(),
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  source: z.string().default("website"),
  landingUrl: z.string().url().optional(),
  fenceType: z.string().optional(),
  fenceParams: z.record(z.unknown()).default({}),
  utm: z.record(z.string()).default({})
});

type PrismaLike = {
  contact: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
    create(args: unknown): Promise<{ id: string }>;
  };
  deal: {
    create(args: unknown): Promise<{ id: string }>;
  };
  task: {
    create(args: unknown): Promise<unknown>;
  };
  leadForm: {
    create(args: unknown): Promise<unknown>;
  };
  utmSource: {
    create(args: unknown): Promise<unknown>;
  };
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
}

export async function handleLeadForm(prisma: PrismaLike, input: unknown) {
  const lead = leadSchema.parse(input);
  const phone = normalizePhone(lead.phone);

  const contact =
    (await prisma.contact.findFirst({
      where: {
        companyId: lead.companyId,
        OR: [{ phone }, lead.email ? { email: lead.email } : undefined].filter(Boolean)
      },
      select: { id: true }
    })) ||
    (await prisma.contact.create({
      data: {
        companyId: lead.companyId,
        name: lead.name,
        phone,
        email: lead.email,
        source: lead.source,
        lastContactAt: new Date()
      },
      select: { id: true }
    }));

  const deal = await prisma.deal.create({
    data: {
      companyId: lead.companyId,
      title: lead.fenceType ? `Заявка: ${lead.fenceType}` : "Заявка с сайта",
      source: lead.source,
      sourceUrl: lead.landingUrl,
      contactId: contact.id,
      pipelineId: "default-pipeline-id",
      stageId: "new-lead-stage-id",
      fenceParams: lead.fenceType
        ? {
            create: {
              fenceType: lead.fenceType,
              ...lead.fenceParams
            }
          }
        : undefined
    },
    select: { id: true }
  });

  await prisma.task.create({
    data: {
      companyId: lead.companyId,
      dealId: deal.id,
      contactId: contact.id,
      title: "Связаться с клиентом",
      dueAt: new Date(Date.now() + 30 * 60 * 1000),
      priority: "HIGH"
    }
  });

  await prisma.utmSource.create({
    data: {
      companyId: lead.companyId,
      dealId: deal.id,
      utmSource: lead.utm.utm_source,
      utmMedium: lead.utm.utm_medium,
      utmCampaign: lead.utm.utm_campaign,
      landingUrl: lead.landingUrl
    }
  });

  await prisma.leadForm.create({
    data: {
      companyId: lead.companyId,
      contactId: contact.id,
      dealId: deal.id,
      source: lead.source,
      landingUrl: lead.landingUrl,
      payload: lead,
      utm: lead.utm
    }
  });

  return { contactId: contact.id, dealId: deal.id };
}
