"use client";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Rocket, Zap } from "lucide-react";

function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 bg-cover"></div>
        <div
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-white/20 blur-[80px]"
          style={{ transform: "translate(-50%, -50%)" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--tertiary-yellow)]/20 blur-[80px]"
          style={{ transform: "translate(50%, 50%)" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center"
      >
        {/* Animated Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full p-5 mb-8 shadow-lg"
        >
          <Rocket className="w-10 h-10 text-white fill-white" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to <span className="text-gray-900">Transform</span> Your Brand?
        </h2>

        {/* Subheading */}
        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
          Partner with us to elevate your marketing strategy and achieve
          remarkable growth. Join hundreds of successful businesses who have
          transformed their digital presence with our proven methods.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <motion.a
            href="#services"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[var(--primary-yellow)] hover:bg-[var(--secondary-yellow)] text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Free Strategy Session <Zap className="w-5 h-5" />
          </motion.a>

          <motion.a
            href="#about"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-[var(--primary-yellow)] text-[var(--primary-yellow)] hover:bg-[var(--primary-yellow)] hover:text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300"
          >
            View Case Studies <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Check, text: "500+ Successful Projects" },
            { icon: Clock, text: "Fast Delivery & Results" },
            { icon: Zap, text: "Instant Strategy Access" },
            { icon: Rocket, text: "24/7 Expert Support" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3 }}
              className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
            >
              <item.icon className="w-5 h-5 text-white" />
              <span className="text-sm text-white font-medium">
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default CTASection;
