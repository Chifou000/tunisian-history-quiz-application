import { motion } from 'framer-motion';

export const TunisiaMap = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="relative w-full h-full max-w-lg flex items-center justify-center"
      >
        <img 
          src="https://i.imgur.com/oAXfpBe.png" 
          alt="Tunisia Map" 
          className="w-full h-full object-contain filter brightness-110 grayscale-[0.5] sepia-[.2] drop-shadow-[0_0_40px_var(--accent-glow)]"
        />
      </motion.div>
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_92%)]" />
    </div>
  );
};
