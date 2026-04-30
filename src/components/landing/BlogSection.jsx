import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_COLORS = {
  Awareness: "bg-purple-100 text-purple-700",
  Liberation: "bg-rose-100 text-rose-700",
  Intention: "bg-amber-100 text-amber-700",
  Vision: "bg-sky-100 text-sky-700",
  Embodiment: "bg-emerald-100 text-emerald-700",
  "Power & Money": "bg-yellow-100 text-yellow-700",
};

export default function BlogSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: "live" }, "-published_date", 3)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-4" style={{ background: "#FAF5F3" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Insights & Wisdom</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            From the Journal
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6E1D40" }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {["Awareness", "Liberation", "Intention"].map((cat) => (
              <ComingSoonCard key={cat} category={cat} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="aspect-video overflow-hidden">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg,#F5E8EE,#DEBECC)" }}>📖</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
            {post.category}
          </span>
          {post.published_date && (
            <span className="text-xs text-gray-400">{format(new Date(post.published_date), "d MMM yyyy")}</span>
          )}
        </div>
        <h3 className="font-bold text-lg leading-snug mb-2" style={{ color: "#3A2A28" }}>{post.title}</h3>
        {post.excerpt && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>}
        <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: "#6E1D40" }}>
          Read more <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ category }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-dashed border-rose-200">
      <div className="aspect-video flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg,#F5E8EE,#FDF5F3)" }}>✨</div>
      <div className="p-6">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[category]}`}>{category}</span>
        <h3 className="font-bold text-lg leading-snug mt-3 mb-2" style={{ color: "#3A2A28" }}>Coming Soon</h3>
        <p className="text-gray-400 text-sm">Wisdom for this pillar is on its way. Join the waitlist to be notified.</p>
      </div>
    </div>
  );
}