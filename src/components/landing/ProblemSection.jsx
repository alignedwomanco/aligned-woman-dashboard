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
    <section className="py-24 lg:py-32 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight leading-tight">
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
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            Women make up the largest share of the wellness, education, and self-development market.
            And yet the tools available to them are <span className="font-semibold text-[#3D2250]">fragmented, shallow, and fundamentally misaligned</span> with how women actually live, work, and grow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16 relative"
        >
          <p className="text-center text-gray-500 mb-12 text-sm uppercase tracking-widest font-medium">
            Right now, women are expected to manage their lives across:
          </p>
          
          {/* Circular orbit layout */}
          <div className="relative w-full max-w-3xl mx-auto" style={{ height: '600px' }}>
            {/* Concentric rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute w-96 h-96 rounded-full border border-purple-200/30" />
              <div className="absolute w-[500px] h-[500px] rounded-full border border-pink-200/20" />
            </motion.div>

            {/* Center circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-2xl z-10"
            >
              <div className="text-white text-center">
                <p className="text-2xl font-light">Fragmented</p>
                <p className="text-lg font-light opacity-80">Tools</p>
              </div>
            </motion.div>

            {/* Orbiting app icons */}
            {fragmentedApps.map((app, index) => {
              const angle = (index / fragmentedApps.length) * 2 * Math.PI;
              const radius = 250;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.div
                  key={app.label}
                  initial={{ 
                    opacity: 0,
                    x: 0,
                    y: 0,
                    scale: 0
                  }}
                  whileInView={{ 
                    opacity: 1,
                    x: x,
                    y: y,
                    scale: 1
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8,
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    zIndex: 20,
                    transition: { duration: 0.2 }
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: '100px' }}
                >
                  <div className="bg-white/80 backdrop-blur-md border-0 rounded-2xl p-4 text-center hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.06)] cursor-pointer">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <app.icon className="w-6 h-6 text-[#3D2250]" />
                    </motion.div>
                    <span className="text-xs font-light text-gray-700 block">{app.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 max-w-3xl mx-auto border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <p className="text-xl text-gray-700 leading-relaxed text-center font-light">
            None of these tools speak to each other.
            <br />
            None of them understand the female nervous system.
            <br />
            None of them integrate body, identity, money, ambition, and leadership.
          </p>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-lg font-light text-gray-900 text-center">
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