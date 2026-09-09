import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck,
  Check,
  ChevronDown,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../hooks/useAuth';

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const AnimatedMetric = ({ value }) => {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const numericValue = Number.parseFloat(value);
    const suffix = value.replace(String(numericValue), '');
    let frame;
    let startTime;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = numericValue % 1 === 0
        ? Math.floor(numericValue * eased)
        : (numericValue * eased).toFixed(1);
      setDisplayValue(`${currentValue}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{displayValue}</>;
};

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (isAuthenticated) return null;

  const scrollToCatalog = () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <PublicLayout>
      <div className="overflow-hidden">
        <section className="landing-hero relative min-h-[680px] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" animate="visible" variants={reveal} className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/75 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-700 shadow-sm backdrop-blur-md">
                <Sparkles size={14} /> A calmer way to discover more
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] text-[#272238] sm:text-7xl lg:text-8xl">
                Make room for
                <span className="block text-primary-600">better stories.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#625a73] sm:text-lg">
                LibraryHub brings your physical shelves, digital reading room, and everyday library life into one beautifully simple place.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/books">
                  <Button size="lg" className="w-full shadow-xl shadow-primary-500/20 sm:w-auto">
                    Explore the collection <ArrowRight size={18} />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={scrollToCatalog} className="w-full bg-white/55 sm:w-auto">
                  See how it works <ChevronDown size={18} />
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-[#756e87]">
                <span className="flex items-center gap-2"><Check size={15} className="text-primary-600" /> Live e-reading</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-primary-600" /> Physical reservations</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-primary-600" /> Human-friendly design</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="glass rounded-[2rem] p-4 shadow-2xl shadow-primary-900/15 sm:p-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.45rem] bg-primary-100">
                  <img
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=85"
                    alt="Students reading together in a bright library"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#302653]/85 p-5 text-white backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-200"><BookOpen size={15} /> A place to keep learning</div>
                    <p className="mt-2 text-lg font-bold leading-snug">Bring your curiosity. We will keep the shelves ready.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-7 hidden rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md sm:block">
                <div className="flex items-center gap-2 text-xs font-bold text-[#42385f]"><Users size={16} className="text-primary-600" /> A library for every kind of reader</div>
              </div>
            </motion.div>
          </div>
          <button type="button" onClick={scrollToCatalog} className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#756e87] md:flex">Scroll to explore <ChevronDown size={15} className="animate-bounce" /></button>
        </section>

        <section className="border-y border-primary-100 bg-white/70 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: '10k+', label: 'titles to discover', icon: BookOpen },
              { value: '5k+', label: 'active readers', icon: Users },
              { value: '99.4%', label: 'on-time returns', icon: CalendarCheck },
              { value: '24/7', label: 'digital access', icon: Sparkles },
            ].map(({ value, label, icon: Icon }, index) => (
              <motion.div key={label} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={reveal} transition={{ delay: index * 0.08 }} className="flex items-center gap-3 md:justify-center">
                <Icon size={19} className="text-primary-500" />
                <div><motion.strong initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 + 0.15, duration: 0.45 }} className="block text-xl font-black text-[#302653] sm:text-2xl"><AnimatedMetric value={value} /></motion.strong><span className="text-[11px] font-semibold text-[#756e87]">{label}</span></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal} className="max-w-2xl">
            <p className="section-kicker">One thoughtful platform</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-[#272238] sm:text-6xl">Everything you need to keep reading.</h2>
            <p className="mt-5 text-base leading-8 text-[#756e87]">Two distinct ways to access knowledge, connected by one calm workflow. Find a title, choose your format, and keep moving.</p>
          </motion.div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} className="group rounded-[2rem] border border-primary-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary-900/10 sm:p-10">
              <div className="flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700"><Search size={25} /></div><span className="text-xs font-bold uppercase tracking-widest text-primary-500">01</span></div>
              <h3 className="mt-10 text-3xl font-bold text-[#302653]">A digital room that travels with you.</h3>
              <p className="mt-4 leading-7 text-[#756e87]">Open e-content in the reader, adjust the experience to suit you, and return to your place whenever inspiration strikes.</p>
              <Link to="/books" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition-transform group-hover:translate-x-1">Browse e-content <ArrowRight size={16} /></Link>
            </motion.article>
            <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} transition={{ delay: 0.12 }} className="group rounded-[2rem] border border-primary-100 bg-[#302653] p-7 text-white shadow-xl shadow-primary-900/15 transition-transform hover:-translate-y-1 sm:p-10">
              <div className="flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary-200"><CalendarCheck size={25} /></div><span className="text-xs font-bold uppercase tracking-widest text-primary-200">02</span></div>
              <h3 className="mt-10 text-3xl font-bold">A physical collection, without the guesswork.</h3>
              <p className="mt-4 leading-7 text-white/65">Use a book code to check availability, request a copy, and follow every step from application to return.</p>
              <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary-200 transition-transform group-hover:translate-x-1">Enter member portal <ArrowRight size={16} /></Link>
            </motion.article>
          </div>
        </section>

        <section className="bg-[#f0ecff] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
              <p className="section-kicker">A little intelligence, thoughtfully used</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#272238] sm:text-5xl">Your library has a better conversation starter.</h2>
              <p className="mt-5 leading-8 text-[#756e87]">Athena helps readers find their next story and gives librarians a clear view of what the collection needs next.</p>
              <Link to="/books" className="mt-8 inline-block"><Button variant="outline" className="bg-white/70">Meet your next book <ArrowRight size={17} /></Button></Link>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal} transition={{ delay: 0.1 }} className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-xl shadow-primary-900/10 backdrop-blur sm:p-7">
              <div className="flex items-center gap-3 border-b border-primary-100 pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 text-white"><Brain size={20} /></div><div><p className="text-sm font-bold text-[#302653]">Athena, your library concierge</p><p className="text-xs text-[#756e87]">Ready when you are</p></div><span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" /></div>
              <div className="mt-5 space-y-4 text-sm"><div className="max-w-md rounded-2xl rounded-tl-none bg-primary-50 p-4 leading-6 text-[#42385f]">Tell me what you feel like reading and I will search the collection with you.</div><div className="ml-auto max-w-xs rounded-2xl rounded-br-none bg-primary-700 p-4 leading-6 text-white">Something curious, optimistic, and not too long.</div><div className="max-w-md rounded-2xl rounded-tl-none bg-primary-50 p-4 leading-6 text-[#42385f]">Try <strong>The Little Prince</strong> or explore our short fiction shelf. I can also check whether a physical copy is available.</div></div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal} className="mx-auto max-w-3xl">
            <p className="section-kicker">Start somewhere wonderful</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-[#272238] sm:text-6xl">There is always another shelf to explore.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-8 text-[#756e87]">Step into the collection, find a familiar favorite, or let Athena surprise you.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/books"><Button size="lg" className="w-full sm:w-auto">Explore the collection <ArrowRight size={18} /></Button></Link><Link to="/register"><Button size="lg" variant="outline" className="w-full sm:w-auto">Create a reader account</Button></Link></div>
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Home;
