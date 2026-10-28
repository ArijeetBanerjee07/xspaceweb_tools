import type { Metadata } from "next";
import {
  LuArrowRight,
  LuChartNoAxesColumnIncreasing,
  LuBuilding2,
  LuFileText,
  LuHandshake,
  LuMail,
  LuPuzzle,
  LuStar,
  LuUsers,
} from "react-icons/lu";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Partnerships | XSW Tools",
  description:
    "Explore business, integration, and strategic partnership opportunities with XSWTOOLS and XSPACEWEB.",
};

const benefits = [
  {
    title: "Growing User Base",
    description: "Reach a global audience of individuals and businesses.",
    icon: LuUsers,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Easy Integration",
    description: "Flexible integration options and developer-friendly APIs.",
    icon: LuPuzzle,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Mutual Growth",
    description: "Let’s create value and grow together.",
    icon: LuChartNoAxesColumnIncreasing,
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Brand Collaboration",
    description: "Co-marketing and product collaboration opportunities.",
    icon: LuStar,
    color: "bg-amber-50 text-amber-500",
  },
];

export default function PartnershipsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#eaf5ff] via-[#f5faff] to-white px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-12 top-16 -z-10 h-40 w-40 rounded-full bg-blue-100/50"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-16 -z-10 h-40 w-40 rounded-full bg-sky-100/50"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[13%] top-8 -z-10 h-0 w-0 border-x-[24px] border-b-[42px] border-x-transparent border-b-blue-100/80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-6 top-20 -z-10 h-24 w-24 opacity-50 [background-image:radial-gradient(#93c5fd_1.5px,transparent_1.5px)] [background-size:14px_14px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-20 -z-10 h-24 w-24 opacity-50 [background-image:radial-gradient(#93c5fd_1.5px,transparent_1.5px)] [background-size:14px_14px]"
          />

          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Partnerships
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
              Let&apos;s build together.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              We are open to collaborations, integrations, and strategic
              partnerships
              <br className="hidden sm:block" /> that create value for users and
              businesses.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1080px] px-5 pb-4 sm:px-8">
          <section
            aria-label="Partnership contacts"
            className="grid gap-5 md:grid-cols-2"
          >
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,35,75,0.06)] sm:p-5">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LuHandshake className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900">
                    Business Partnerships
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Collaborate with us for integrations, distribution,
                    co-marketing, or strategic alliances.
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-900">
                    Rahul Kumar
                  </p>
                  <p className="text-xs text-slate-500">
                    Director &amp; Business Partnership Manager
                  </p>
                </div>
              </div>
              <a
                href="mailto:partnerships@xswtools.com"
                className="mt-4 flex min-h-10 items-center gap-3 rounded-lg bg-blue-50/80 px-3 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                <LuMail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  partnerships@xswtools.com
                </span>
                <span className="sr-only">Email business partnerships</span>
              </a>
              <a
                href="mailto:partnerships@xswtools.com?subject=Business%20partnership%20inquiry"
                className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0861f5] px-4 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Send Partnership Enquiry
                <LuArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,35,75,0.06)] sm:p-5">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LuBuilding2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900">
                    Partner with XSPACEWEB
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    For collaborations with our other products under XSPACEWEB,
                    business opportunities, or group partnerships.
                  </p>
                  <p className="mt-3 text-xs font-bold text-slate-900">
                    XSPACEWEB Partner Team
                  </p>
                  <p className="text-xs text-slate-500">
                    Strategic Partnerships &amp; Business Development
                  </p>
                </div>
              </div>
              <a
                href="mailto:partnership@xspaceweb.com"
                className="mt-4 flex min-h-10 items-center gap-3 rounded-lg bg-blue-50/80 px-3 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                <LuMail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  partnership@xspaceweb.com
                </span>
                <span className="sr-only">Email XSPACEWEB partnerships</span>
              </a>
              <a
                href="mailto:partnership@xspaceweb.com?subject=XSPACEWEB%20partnership%20inquiry"
                className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Contact XSPACEWEB
                <LuArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </article>
          </section>

          <section className="mt-4">
            <h2 className="text-center text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Why Partner with XSWTOOLS?
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ title, description, icon: Icon, color }) => (
                <article key={title} className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white p-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <LuFileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-900">
                Have a Partnership Proposal?
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                We&apos;d love to hear your ideas. Share a few details about your
                organization and how you&apos;d like to work together.
              </p>
            </div>
            <a
              href="mailto:partnerships@xswtools.com?subject=Partnership%20proposal"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0861f5] px-5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Get In Touch
              <LuArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
