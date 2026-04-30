import React from "react";
import { Link } from "react-router-dom";
import { Mail, Users, Building2, Handshake, Newspaper, MessageCircle, Send } from "lucide-react";

const contactOptions = [
  {
    type: "apply_programme",
    icon: Users,
    title: "Apply for the Programme",
    description: "Ready to transform? Apply for The Aligned Woman Blueprint™.",
    color: "from-[#6E1D40] to-[#943A59]",
    badge: "Most Popular",
  },
  {
    type: "apply_expert",
    icon: Handshake,
    title: "Apply as an Expert",
    description: "Join our panel of world-class experts and reach our aligned community.",
    color: "from-[#943A59] to-[#B85A7A]",
    badge: null,
  },
  {
    type: "corporate_di",
    icon: Building2,
    title: "Corporate & D&I Enquiry",
    description: "Bring The Aligned Woman to your workplace or diversity initiative.",
    color: "from-[#5A1633] to-[#6E1D40]",
    badge: null,
  },
  {
    type: "brand_collab",
    icon: Handshake,
    title: "Brand Collaboration",
    description: "Partner with us to reach conscious, high-achieving women.",
    color: "from-[#B85A7A] to-[#D4849A]",
    badge: null,
  },
  {
    type: "press",
    icon: Newspaper,
    title: "Press Enquiry",
    description: "Media kit, interviews, features — we'd love to share our story.",
    color: "from-[#7A2550] to-[#943A59]",
    badge: null,
  },
  {
    type: "newsletter",
    icon: Send,
    title: "Newsletter Signup",
    description: "Get wisdom, insights and updates from The Aligned Woman directly.",
    color: "from-[#D4849A] to-[#E8B4AE]",
    badge: null,
  },
  {
    type: "general",
    icon: MessageCircle,
    title: "General Enquiry",
    description: "Have a question? We're here and happy to help.",
    color: "from-[#6E1D40] to-[#7A2550]",
    badge: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF5F3] via-white to-[#F5E8EE]">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#943A59] font-semibold tracking-widest uppercase text-sm mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-serif text-[#6E1D40] mb-6 leading-tight">
            How Can We<br />Help You?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're ready to join, collaborate, or simply curious — we have a dedicated team for every kind of conversation.
          </p>
        </div>
      </section>

      {/* Contact Options Grid */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.type}
                to={`/contact-form?type=${option.type}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {option.badge && (
                  <div className="absolute top-4 right-4 bg-[#6E1D40] text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                    {option.badge}
                  </div>
                )}
                <div className={`h-2 bg-gradient-to-r ${option.color}`} />
                <div className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif text-[#6E1D40] mb-3">{option.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
                  <div className="mt-6 flex items-center text-[#943A59] font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#6E1D40] py-16 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <Mail className="w-12 h-12 mx-auto mb-4 text-white/60" />
          <h2 className="text-2xl font-serif mb-3">Prefer Email?</h2>
          <p className="text-white/70 mb-6">You can also reach us directly at</p>
          <a
            href="mailto:hello@thealignedwoman.com"
            className="text-[#E8B4AE] font-semibold text-lg hover:text-white transition-colors"
          >
            hello@thealignedwoman.com
          </a>
        </div>
      </section>
    </div>
  );
}