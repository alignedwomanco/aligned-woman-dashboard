import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Brain, Heart, DollarSign, Dumbbell, Calendar, Target, Pill } from "lucide-react";

const fragmentedApps = [
  { icon: Calendar, label: "Cycle tracking" },
  { icon: Brain, label: "Journaling" },
  { icon: Heart, label: "Meditation" },
  { icon: Target, label: "Manifestation" },
  { icon: Smartphone, label: "Productivity" },
  { icon: Dumbbell, label: "Fitness" },
  { icon: DollarSign, label: "Money" },
  { icon: Pill, label: "Therapy" },
];

export default function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3D2250] tracking-tight leading-tight">
            Women Are Not Broken.
            <br />
            <span style={{ color: '#a861e9' }}>The Systems They're Using Are.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-xl text-gray-600 leading-relaxed">
            Women make up the largest share of the wellness, education, and self-development market.
            And yet the tools available to them are <span className="font-semibold text-[#3D2250]">fragmented, shallow, and fundamentally misaligned</span> with how women actually live, work, and grow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-widest font-medium">
            Right now, women are expected to manage their lives across:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {fragmentedApps.map((app, index) => (
              <motion.div
                key={app.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:border-[#C67793]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <app.icon className="w-6 h-6 text-[#3D2250]" />
                </div>
                <span className="text-sm font-medium text-gray-700">{app.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8 lg:p-12 max-w-3xl mx-auto border border-pink-100"
        >
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            None of these tools speak to each other.
            <br />
            None of them understand the female nervous system.
            <br />
            None of them integrate body, identity, money, ambition, and leadership.
          </p>
          <div className="mt-8 pt-8 border-t border-pink-200">
            <p className="text-lg font-medium text-[#3D2250] text-center">
              The result is not growth.
              <br />
              <span style={{ color: '#a861e9' }}>It is overwhelm disguised as self-improvement.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}