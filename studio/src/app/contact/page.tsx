import type { Metadata } from "next";
import {
  LuArrowRight,
  LuBuilding2,
  LuMail,
  LuMapPin,
} from "react-icons/lu";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Contact Us | XSW Tools",
  description:
    "Contact XSW Tools with questions, suggestions, partnership ideas, or career inquiries.",
};

const socialLinks = [
  { label: "X", href: "https://x.com", icon: FaXTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
  { label: "Email", href: "mailto:hello@xswtools.com", icon: LuMail },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-[#0b2b5b]">
      <Navbar />

      <main>
        <section className="px-6 pb-12 pt-20 sm:px-10 sm:pt-24 lg:px-16 lg:pb-14">
          <div className="mx-auto max-w-[1440px]">
            <p className="mb-3 text-sm font-semibold tracking-[0.14em] text-slate-500">
              CONTACT US
            </p>
            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[#082653] sm:text-6xl lg:text-7xl">
              CONTACT <span className="text-[#075cf5]">US</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-500 sm:text-xl">
              Have any questions, suggestions or project ideas in mind?
              <br className="hidden sm:block" /> Don&apos;t hesitate to reach out,
              and let&apos;s have a conversation.
            </p>
          </div>
        </section>

        <section className="bg-[#f7faff] px-6 py-12 sm:px-10 lg:px-16 lg:py-14">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr_auto] lg:gap-12">
            <div className="lg:pr-4">
              <h2 className="text-2xl font-bold tracking-tight text-[#0b2b5b]">
                GET IN TOUCH
              </h2>
              <p className="mt-3 max-w-lg text-lg leading-relaxed text-slate-500">
                Simply want to connect or have a general inquiry? Feel free to
                reach out, and we&apos;ll get back to you as soon as we can.
              </p>
              <a
                href="mailto:hello@xswtools.com"
                className="mt-7 inline-block break-all text-3xl font-bold tracking-tight text-[#082653] hover:text-[#075cf5] sm:text-4xl lg:text-[2.7rem]"
              >
                hello@xswtools.com
              </a>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#075cf5]">
                    <LuMail className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-slate-900">Email</h3>
                    <a
                      href="mailto:hello@xswtools.com"
                      className="mt-1 text-lg text-slate-500 hover:text-[#075cf5]"
                    >
                      hello@xswtools.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#075cf5]">
                    <LuMapPin className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-slate-900">Address</h3>
                    <p className="mt-1 text-lg leading-relaxed text-slate-500">
                      Plot no. 766 &amp; 767, New Colony Muraidih,
                      <br className="hidden sm:block" /> Pochari, Dhanbad,
                      Jharkhand, India, 828306
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#075cf5]">
                    <LuBuilding2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-slate-900">Company</h3>
                    <p className="mt-1 text-lg leading-relaxed text-slate-500">
                      XSPACEWEB PRIVATE LIMITED
                      <br />
                      CIN: U62012JH2024PTC
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-[#0b2b5b]">
                  SEND A SUGGESTION
                </h2>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-slate-500">
                  Feel free to share your ideas, feature requests or
                  recommendations with us. We&apos;re always eager to hear your
                  thoughts on how we can make XSWTOOLS even better.
                </p>
                <a
                  href="mailto:hello@xswtools.com?subject=Suggestion%20for%20XSW%20Tools"
                  className="mt-5 inline-flex min-h-16 min-w-60 items-center justify-center gap-3 rounded-full bg-[#082f70] px-8 text-base font-semibold text-white transition hover:bg-[#075cf5]"
                >
                  Send a Message
                  <LuArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </section>

              <section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight text-[#0b2b5b]">
                  JOIN OUR TEAM
                </h2>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-slate-500">
                  Interested in teaming up? Whether it&apos;s for a partnership,
                  internship, or a career opportunity, we&apos;d love to hear
                  from you. Get in touch to explore the potential of working
                  together.
                </p>
                <a
                  href="mailto:hello@xswtools.com?subject=Career%20or%20partnership%20inquiry"
                  className="mt-5 inline-flex min-h-16 min-w-52 items-center justify-center gap-3 rounded-full bg-[#082f70] px-8 text-base font-semibold text-white transition hover:bg-[#075cf5]"
                >
                  Apply Now
                  <LuArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </section>
            </div>

            <nav
              aria-label="Social media"
              className="flex items-center justify-center gap-3 lg:flex-col lg:justify-start"
            >
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label === "Email" ? "Email XSW Tools" : `XSW Tools on ${label}`}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-100 bg-[#edf4ff] text-[#082f70] transition hover:border-blue-300 hover:bg-blue-100"
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#06265a] px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-16">
          <div className="pointer-events-none absolute -left-20 bottom-[-11rem] h-80 w-80 rounded-full border-[4rem] border-blue-700/30" />
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[4rem] border-blue-700/30" />
          <div className="relative mx-auto max-w-6xl">
            <h2 className="text-center text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              LET&apos;S WORK
              <br />
              <span className="text-[#329cf4]">TOGETHER.</span>
            </h2>
            <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-5 text-lg sm:flex-row sm:justify-between sm:text-2xl">
              <span>Have a project in mind?</span>
              <div className="hidden h-px flex-1 bg-white sm:block" />
              <a
                href="mailto:hello@xswtools.com"
                className="inline-flex items-center gap-3 transition hover:text-blue-300"
              >
                Say hello
                <LuArrowRight className="h-7 w-7" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
