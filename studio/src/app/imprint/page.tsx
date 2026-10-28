import type { Metadata } from "next";
import Link from "next/link";
import {
  LuFileText,
  LuGlobe,
  LuInfo,
  LuMail,
  LuMapPin,
  LuPhone,
  LuUserRound,
  LuX,
} from "react-icons/lu";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Imprint | XSW Tools",
  description: "Company information and official contact details for XSWTOOLS.",
};

const companyDetails = [
  {
    label: "Registered Office",
    icon: LuMapPin,
    value: (
      <>
        Plot No. 766 &amp; 767, New Colony Muraidih, Pochari,
        <br className="hidden sm:block" /> Dhanbad, Jharkhand, India – 828306
      </>
    ),
  },
  { label: "CIN", icon: LuFileText, value: "U62012JH2024PTC022737" },
  { label: "Chief Executive", icon: LuUserRound, value: "Dhrub Kumar Karmkar" },
  {
    label: "Email",
    icon: LuMail,
    value: (
      <a
        href="mailto:team@xswtools.com"
        className="font-medium text-blue-600 hover:text-blue-700"
      >
        team@xswtools.com
      </a>
    ),
  },
  {
    label: "Phone",
    icon: LuPhone,
    value: (
      <a
        href="tel:+918292526386"
        className="text-slate-700 hover:text-blue-600"
      >
        +91 8292526386
      </a>
    ),
  },
  {
    label: "Website",
    icon: LuGlobe,
    value: (
      <Link href="/" className="font-medium text-blue-600 hover:text-blue-700">
        XSWTOOLS
      </Link>
    ),
  },
];

export default function ImprintPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1">
        <header className="relative isolate overflow-hidden bg-gradient-to-b from-blue-50 via-[#f6faff] to-white px-5 pb-9 pt-8 text-center sm:pb-12 sm:pt-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-10%] bottom-[-3.5rem] -z-10 h-24 rounded-[50%] bg-blue-100/45 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[18%] bottom-[-4.5rem] -z-10 h-24 rounded-[50%] bg-sky-100/70 blur-xl"
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Imprint
          </h1>
          <p className="mt-1 text-lg font-medium text-slate-500 sm:text-xl">
            Company Information
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500"
          >
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span>Legal</span>
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="font-medium text-blue-600">
              Imprint
            </span>
          </nav>
        </header>

        <section className="px-5 pb-10 pt-2 sm:px-8 sm:pb-12 sm:pt-3">
          <div className="mx-auto max-w-[740px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_42px_rgba(15,35,75,0.07)] sm:p-7">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LuX className="h-8 w-8 stroke-[3]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Company Information
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                  XSPACEWEB PRIVATE LIMITED
                </h2>
              </div>
            </div>

            <dl className="divide-y divide-slate-100">
              {companyDetails.map(({ label, icon: Icon, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3 py-3 sm:grid-cols-[1.25rem_8rem_0.75rem_minmax(0,1fr)] sm:gap-x-3"
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  <dt className="text-sm text-slate-600">{label}</dt>
                  <span
                    aria-hidden="true"
                    className="hidden text-center text-slate-400 sm:block"
                  >
                    :
                  </span>
                  <dd className="col-start-2 text-sm leading-relaxed text-slate-800 sm:col-start-4">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-2 flex gap-4 border-t border-slate-100 pt-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LuInfo className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Company Information Disclaimer
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                  XSWTOOLS is a product and brand operated by XSPACEWEB PRIVATE
                  LIMITED. The information on this page is provided for company
                  identification, transparency, and official business or legal
                  communication.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                  For enquiries, please contact us using the official contact
                  details listed above.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
