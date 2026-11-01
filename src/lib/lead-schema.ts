import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+\d][\d\s()-]+$/, "Enter a valid phone number");

const base = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email").max(200),
  phone,
  institution: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  message: z.string().trim().max(3000).optional(),
  // Hidden "honeypot" field: real people leave it empty, bots fill it in.
  website: z.string().max(0).optional(),
  source: z.record(z.string(), z.string().max(300)).optional(),
});

const quoteItem = z.object({
  productId: z.string().min(1),
  slug: z.string(),
  name: z.string().max(200),
  qty: z.number().int().positive().max(10_000_000),
  unit: z.string().max(40),
  options: z.record(z.string(), z.string().max(100)),
  customization: z.string().max(500).optional(),
});

export const leadSchema = z.discriminatedUnion("type", [
  base.extend({
    type: z.literal("QUOTE"),
    institution: z.string().trim().min(2, "Enter your institution").max(150),
    items: z.array(quoteItem).min(1, "Your quote basket is empty").max(100),
  }),
  base.extend({
    type: z.literal("DEMO"),
    institution: z.string().trim().min(2, "Enter your institution").max(150),
    solution: z.string().max(80).optional(),
    preferredDate: z.iso.date().optional().or(z.literal("")),
  }),
  base.extend({
    type: z.literal("CONTACT"),
    message: z.string().trim().min(5, "Tell us a little about what you need").max(3000),
  }),
  base.extend({
    type: z.literal("PARTNER"),
    city: z.string().trim().min(2, "Enter your city").max(100),
  }),
]);

export type LeadInput = z.infer<typeof leadSchema>;
