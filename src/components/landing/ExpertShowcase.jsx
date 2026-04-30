import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function ExpertShowcase() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Expert.list("-created_date", 6)
      .then(setExperts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Expert Panels</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            World-Class Guides
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Curated experts across every dimension of a woman's life — health, wealth, relationships, and purpose.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6E1D40" }} />
          </div>
        ) : experts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5E8EE] to-[#FDF5F3] aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[3/4]"
              >
                {expert.profile_image ? (
                  <img src={expert.profile_image} alt={expert.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg,#F5E8EE,#DEBECC)" }}>
                    🌸
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-bold text-lg leading-tight">{expert.name}</h3>
                  {expert.title && <p className="text-white/75 text-sm mt-0.5">{expert.title}</p>}
                  {expert.specialization && (
                    <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      {expert.specialization}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}