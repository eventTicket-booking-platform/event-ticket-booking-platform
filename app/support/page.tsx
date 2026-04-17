import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { faqItems } from "@/lib/mock-data";

export default function SupportPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Support"
        title="Help center, FAQs, and a direct contact form."
        description="The support page keeps common questions self-serve and leaves a structured path for escalation when users need help."
      />
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-[2rem] border border-white/10 bg-[color:var(--card)] p-6">
              <summary className="cursor-pointer text-lg font-semibold text-white">{item.question}</summary>
              <p className="mt-4 text-sm leading-7 text-white/62">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-white">Contact us</h2>
            <div className="mt-6 grid gap-4">
              <Input placeholder="Name" />
              <Input type="email" placeholder="Email" />
              <Input placeholder="Subject" />
              <textarea
                placeholder="Message"
                className="min-h-36 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
              />
              <Button>Send Message</Button>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white">Support details</h3>
            <div className="mt-5 space-y-4 text-sm text-white/62">
              <p>Email: support@eventhub.app</p>
              <p>Phone: +1 (800) 555-0199</p>
              <p>Live chat: Weekdays, 9:00 AM to 7:00 PM PT</p>
              <p>Priority booking help available for VIP and premium tier orders.</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
