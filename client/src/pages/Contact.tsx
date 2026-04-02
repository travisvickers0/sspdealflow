import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Phone, Mail, Calendar, ArrowRight, Check } from "lucide-react";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (val: string) => {
    setInterests((prev) =>
      prev.includes(val)
        ? prev.filter((i) => i !== val)
        : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.email) {
      setError("Name and email are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          interests,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactMethods = [
    {
      href: "tel:+17704808675",
      icon: <Phone className="h-5 w-5 text-[#e8432d]" />,
      iconBg: "bg-[rgba(232,67,45,0.1)]",
      label: "Call us",
      value: "(770) 480-8675",
      sub: "Mon-Fri, 8am-6pm ET",
    },
    {
      href: "mailto:invest@sspdealflow.com",
      icon: <Mail className="h-5 w-5 text-[#0d0c0b]" />,
      iconBg: "bg-[rgba(13,12,11,0.06)]",
      label: "Email us",
      value: "invest@sspdealflow.com",
      sub: "We reply within 1 business day",
    },
    {
      href: "#",
      icon: <Calendar className="h-5 w-5 text-[#16a34a]" />,
      iconBg: "bg-[rgba(22,163,74,0.08)]",
      label: "Schedule a call",
      value: "Book a 20-min intro call",
      sub: "Pick a time that works for you",
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setLocation("/qualify");
      },
    },
  ];

  const interestOptions = [
    "Investing in a deal",
    "Learning how it works",
    "Deal alerts",
    "Something else",
  ];

  return (
    <Layout transparentNavDark>
      <div className="bg-[#f7f4ef]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-3">
              Get in touch
            </p>
            <h1
              className="font-bold tracking-[-0.03em] text-[#0d0c0b] leading-[0.95] mb-5"
              style={{ fontSize: "clamp(40px,5vw,60px)" }}
            >
              Let&apos;s talk
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontWeight: 400,
                  display: "block",
                }}
              >
                real estate
              </em>
            </h1>
            <p className="text-[16px] text-[rgba(13,12,11,0.5)] leading-[1.75] max-w-[400px] mb-12">
              Whether you&apos;re an accredited investor ready to put capital to work or just
              want to learn how the JV structure works - we&apos;re happy to have a real
              conversation.
            </p>

            <div className="flex flex-col gap-[3px] mb-12">
              {contactMethods.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={item.onClick}
                  className="flex items-center gap-4 px-4 py-4 bg-white border border-[rgba(13,12,11,0.06)] rounded-[14px] no-underline transition-all group hover:border-[rgba(13,12,11,0.14)] hover:translate-x-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                >
                  <div className={`w-11 h-11 rounded-[12px] flex-shrink-0 flex items-center justify-center ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.35)] mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-[14px] font-semibold text-[#0d0c0b]">{item.value}</div>
                    <div className="text-[11px] text-[rgba(13,12,11,0.4)] mt-0.5">{item.sub}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[rgba(13,12,11,0.25)] flex-shrink-0 group-hover:text-[#e8432d] group-hover:translate-x-[3px] transition-all" />
                </a>
              ))}
            </div>

            <div className="bg-[#ede9e1] rounded-[14px] px-5 py-4 flex items-center gap-3">
              <span className="w-2 h-2 bg-[#22c55e] rounded-full flex-shrink-0 animate-pulse" />
              <p className="text-[13px] text-[rgba(13,12,11,0.6)] leading-[1.6]">
                <strong className="text-[#0d0c0b] font-semibold">Typically respond within 2 hours</strong>
                {" "}during business hours. We don&apos;t use a call center - you&apos;ll talk to Dustin directly.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] p-8 md:p-9 shadow-[0_2px_16px_rgba(0,0,0,0.06)] lg:sticky lg:top-[88px]">
            {success ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-[rgba(22,163,74,0.1)] border border-[rgba(22,163,74,0.2)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-[#16a34a]" />
                </div>
                <div className="text-[20px] font-bold text-[#0d0c0b] mb-2 tracking-[-0.02em]">
                  Message sent!
                </div>
                <p className="text-[14px] text-[rgba(13,12,11,0.5)] leading-[1.7]">
                  Thanks for reaching out. We&apos;ll be in touch within 1 business day -
                  usually much sooner.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="text-[20px] font-bold text-[#0d0c0b] tracking-[-0.02em] mb-1">
                  Send us a message
                </div>
                <p className="text-[13px] text-[rgba(13,12,11,0.45)] mb-7">
                  Fill this out and we&apos;ll reach out within 1 business day.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    ["firstName", "First Name", "Dustin"],
                    ["lastName", "Last Name", "Cole"],
                  ].map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.45)] mb-1.5">
                        {label}
                      </label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={form[key as keyof typeof form]}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full bg-[#f7f4ef] border border-[rgba(13,12,11,0.1)] rounded-[10px] text-[#0d0c0b] text-[14px] px-3.5 py-3 outline-none placeholder:text-[rgba(13,12,11,0.3)] focus:border-[#e8432d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,67,45,0.06)] transition-all font-['DM_Sans',sans-serif]"
                      />
                    </div>
                  ))}
                </div>

                {[
                  ["email", "Email", "email", "you@example.com"],
                  ["phone", "Phone", "tel", "(404) 555-0123"],
                ].map(([key, label, type, placeholder]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.45)] mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full bg-[#f7f4ef] border border-[rgba(13,12,11,0.1)] rounded-[10px] text-[#0d0c0b] text-[14px] px-3.5 py-3 outline-none placeholder:text-[rgba(13,12,11,0.3)] focus:border-[#e8432d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,67,45,0.06)] transition-all font-['DM_Sans',sans-serif]"
                    />
                  </div>
                ))}

                <div className="mb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.45)] mb-2">
                    I&apos;m interested in
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map((option) => {
                      const checked = interests.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleInterest(option)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium text-left transition-all border ${
                            checked
                              ? "border-[#e8432d] bg-[rgba(232,67,45,0.05)] text-[#0d0c0b]"
                              : "border-[rgba(13,12,11,0.1)] bg-[#f7f4ef] text-[rgba(13,12,11,0.6)] hover:border-[rgba(13,12,11,0.2)] hover:text-[#0d0c0b]"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-all ${
                              checked
                                ? "bg-[#e8432d] border-[#e8432d]"
                                : "bg-white border-[rgba(13,12,11,0.2)]"
                            }`}
                          >
                            {checked && <Check className="h-2.5 w-2.5 text-white stroke-[2.5]" />}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.45)] mb-1.5">
                    Message{" "}
                    <span className="normal-case tracking-normal font-normal text-[rgba(13,12,11,0.3)]">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us a bit about yourself or what you're looking for..."
                    value={form.message}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        message: e.target.value,
                      }))
                    }
                    className="w-full bg-[#f7f4ef] border border-[rgba(13,12,11,0.1)] rounded-[10px] text-[#0d0c0b] text-[14px] px-3.5 py-3 outline-none resize-none leading-[1.6] placeholder:text-[rgba(13,12,11,0.3)] focus:border-[#e8432d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,67,45,0.06)] transition-all font-['DM_Sans',sans-serif]"
                  />
                </div>

                {error && <p className="text-[12px] text-[#e8432d] mb-3">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0d0c0b] hover:bg-[#e8432d] disabled:opacity-50 text-white font-semibold text-[14px] py-3.5 rounded-[12px] border-none cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-px"
                >
                  {submitting ? "Sending..." : "Send Message"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
                <p className="text-[11px] text-[rgba(13,12,11,0.35)] text-center mt-3">
                  No spam. No commitment. Just a real conversation.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
