
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Layers, Scissors, ShieldCheck, Users } from 'lucide-react';
import aboutImage from "../assets/aboutImage.PNG";
import circleLogo from "../assets/teesx-logo-circle.jpg";

const About = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-180deg", "180deg"]);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-900/20 blur-[120px] rounded-full" />

      <main className="max-w-7xl mx-auto px-8 pt-36 pb-16 grid lg:grid-cols-2 gap-12 items-center min-h-screen">

        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 space-y-6"
        >
          <div className="flex items-center gap-3">
            <img src={circleLogo} alt="TeesX Brand Seal" className="w-12 h-12 rounded-full border border-white/10 shadow-lg p-0.5 bg-white object-contain" />
            <span className="text-[10px] text-green-400 font-black tracking-widest uppercase bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">Official Brand Ethos</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black italic leading-none mb-6">
            WE DON'T JUST MAKE JERSEYS , <br />
            <span className="text-green-500"> WE CREATE IDENTITY.</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mb-12 leading-relaxed">
            We are passionate about design, comfort and performance. Every jersey we create is crafted with premium materials and attention to detail.
          </p>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <FeatureItem icon={<Layers size={24} />} title="PREMIUM QUALITY" desc="High quality fabric for maximum comfort." />
            <FeatureItem icon={<Scissors size={24} />} title="CRAFTED WITH CARE" desc="Expertly designed with precision and passion." />
            <FeatureItem icon={<ShieldCheck size={24} />} title="BUILT TO PERFORM" desc="Made for durability, made to win." />
          </div>

          <motion.div whileHover={{ scale: 1.05 }} className="relative inline-block cursor-pointer">
            <div className="bg-green-500 text-black px-8 py-4 flex items-center gap-4 font-black italic rounded-2xl">
              <Users className="bg-black text-green-500 p-1 rounded-sm" />
              <div>
                <div className="text-[10px] leading-none uppercase">More than clothing,</div>
                <div className="text-xl">WE BUILD CONFIDENCE.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Fixed 3D Rotation */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-[600px] flex items-center justify-center cursor-move"
          style={{ perspective: "1200px" }}
        >
          <div
            className="absolute bottom-10 w-[120%] h-[150px] bg-gradient-to-t from-green-900/40 to-transparent rounded-[100%] border-b-4 border-green-500/50 shadow-[0_20px_50px_rgba(34,197,94,0.3)]"
            style={{ transform: "rotateX(60deg)" }}
          />

          <motion.div
            style={{
              rotateY,
              rotateX,
              transformStyle: "preserve-3d",
            }}
            className="relative z-20 flex items-center justify-center"
          >
            <img
              src={aboutImage}
              alt="Jerseys Showcase"
              className="drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)] max-h-[450px] w-auto pointer-events-none"
            />

            <div
              className="absolute -bottom-10 right-0 bg-black/80 backdrop-blur-md border-l-4 border-green-500 p-4 transform -rotate-3 z-40"
              style={{ transform: "translateZ(50px)" }}
            >
              <p className="text-[10px] text-gray-400 uppercase">Designed to stand out.</p>
              <h3 className="text-green-500 font-bold">MADE TO LAST.</h3>
            </div>
          </motion.div>

          <div className="absolute top-20 left-10 text-gray-800 text-6xl font-black opacity-20 select-none">
            PASSION<br />PERFORMANCE<br />PRIDE
          </div>
        </div>
      </main>


    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex flex-col gap-3">
    <div className="w-12 h-12 rounded-full border border-green-500/30 flex items-center justify-center text-green-500 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
      {icon}
    </div>
    <h4 className="text-xs font-bold text-green-500">{title}</h4>
    <p className="text-[10px] text-gray-500 leading-tight">{desc}</p>
  </div>
);

export default About