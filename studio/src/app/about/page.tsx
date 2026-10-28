import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "About Us | XSW Tools",
  description:
    "XSWTOOLS is a simple and powerful online tools workspace, created to make everyday digital work easier.",
};

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-7 inline-flex items-center gap-2 border-b border-slate-900 pb-1.5 text-sm font-semibold text-slate-900 transition hover:border-blue-600 hover:text-blue-600"
    >
      {children}
      <LuArrowRight className="w-4 h-4" />
    </Link>
  );
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-10 sm:pt-14 pb-4">
          {/* Page heading */}
          <p className={EYEBROW}>About Us</p>
          <h1 className="mt-2 text-[clamp(2.75rem,7.2vw,5.5rem)] font-black leading-[0.95] tracking-[-0.045em] text-slate-900">
            ABOUT US
          </h1>

          <div className="mt-8 sm:mt-10 overflow-hidden rounded-[22px] bg-slate-100">
            <img
              src="/about/hero.jpg"
              alt="A retro computer standing in a green meadow under a bright blue sky"
              fetchPriority="high"
              className="w-full aspect-[3/1] object-cover"
            />
          </div>

          {/* Intro statement */}
          <div className="mt-12 sm:mt-16 grid gap-6 lg:grid-cols-12 lg:gap-10">
            <h2 className="lg:col-span-7 text-[clamp(1.5rem,2.9vw,2.35rem)] font-bold leading-[1.18] tracking-[-0.02em] text-slate-900">
              XSWTOOLS is a simple and powerful online tools workspace, created to
              make everyday digital work easier.
            </h2>
            <p className="lg:col-span-4 lg:col-start-9 lg:self-center text-[15px] leading-relaxed text-slate-500">
              We bring essential and advanced tools together in one place, so you
              don&apos;t have to visit multiple websites for different tasks.
            </p>
          </div>

          {/* Our mission */}
          <section className="mt-16 sm:mt-24 grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-md">
              <p className={EYEBROW}>Our Mission</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
                Make Digital Work Easier.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                Our mission is to provide useful, simple and reliable tools for
                individuals, students, creators, businesses and teams — without
                unnecessary complexity.
              </p>
              <TextLink href="/app/tools">Explore Tools</TextLink>
            </div>
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              <img
                src="/about/mission.jpg"
                alt="An olive tree beside a white concrete building under a clear blue sky"
                loading="lazy"
                className="w-full aspect-[1.45/1] object-cover"
              />
            </div>
          </section>

          {/* Our promise */}
          <section className="mt-16 sm:mt-24 grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 overflow-hidden rounded-2xl bg-slate-100 lg:order-1">
              <img
                src="/about/promise.jpg"
                alt="A white mug on a stack of books beside a laptop in morning light"
                loading="lazy"
                className="w-full aspect-[1.45/1] object-cover"
              />
            </div>
            <div className="order-1 max-w-md lg:order-2">
              <p className={EYEBROW}>Our Promise</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-slate-900">
                Easy to Use.
                <br />
                Always Improving.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                We are committed to giving you a clean experience, useful features
                and regular updates. We keep listening to your feedback and continue
                to add new tools and creative features to make your digital work even
                better.
              </p>
              <TextLink href="/contact">Share Feedback</TextLink>
            </div>
          </section>

          {/* Let's build together */}
          <section className="mx-auto mt-20 max-w-2xl text-center sm:mt-28">
            <p className={EYEBROW}>Let&apos;s Build Together</p>
            <h2 className="mt-5 text-[clamp(1.5rem,3.2vw,2.1rem)] font-bold leading-[1.25] tracking-[-0.02em] text-slate-900">
              Have an idea, feedback or a tool you&apos;d like us to build? We&apos;d
              love to hear from you.
            </h2>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] active:scale-[0.98]"
            >
              Share Your Feedback
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Closing call to action */}
          <section className="relative mt-16 sm:mt-24 overflow-hidden rounded-[24px] bg-[#3053fe] px-6 py-16 text-center text-white sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 24px, rgba(0,0,0,0.05) 24px 48px)",
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-[clamp(1.75rem,3.8vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                Get started today and unlock the power of our solutions.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-blue-100">
                Experience the all-in-one workspace designed for creators, teams, and
                fast-growing businesses.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
              >
                Start 14 Days Free Trial
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
