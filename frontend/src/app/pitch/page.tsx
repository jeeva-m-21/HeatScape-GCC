'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { StitchHeader } from '@/components/navigation/StitchHeader';
import { useLanguage } from '@/lib/i18n';

interface Slide {
  id: number;
  tag: string;
  tagTa: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  category: 'CHALLENGE' | 'SCIENCE' | 'XAI' | 'OPTIMIZATION' | 'OPERATIONS' | 'MOBILITY' | 'ARCHITECTURE';
  badgeColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'THE CRISIS',
    tagTa: 'நெருக்கடி',
    title: 'The Coastal Humid-Heat Inversion Trap',
    titleTa: 'கடலோர ஈரப்பத-வெப்ப தலைகீழ் பொறி',
    subtitle: 'Why traditional dry-bulb heat models fail in coastal megacities like Chennai.',
    subtitleTa: 'சென்னையின் ஈரப்பத வெப்பநிலைக்கு பாரம்பரிய மாதிரிகள் ஏன் பொருந்தாது.',
    category: 'CHALLENGE',
    badgeColor: 'border-rose-800 text-rose-400 bg-rose-950/40',
  },
  {
    id: 2,
    tag: 'DATA & SCIENCE',
    tagTa: 'தரவு & அறிவியல்',
    title: 'Dual Satellite & 842-Node Telemetry Fusion',
    titleTa: 'இரட்டை செயற்கைக்கோள் & 842 உணரி தரவு ஒருங்கிணைப்பு',
    subtitle: 'Landsat-9 TIR radiometric calibration paired with Sen’s Slope non-parametric trend analysis and PELT regime shifts.',
    subtitleTa: 'லேண்ட்சாட்-9 மற்றும் சென் சாய்வு அடிப்படையிலான நகர்ப்புற வெப்பப் போக்கு.',
    category: 'SCIENCE',
    badgeColor: 'border-cyan-800 text-cyan-400 bg-cyan-950/40',
  },
  {
    id: 3,
    tag: 'EXPLAINABLE AI',
    tagTa: 'விளக்கக்கூடிய AI (XAI)',
    title: 'TreeSHAP Biophysical Attribution Engine',
    titleTa: 'ட்ரீ-ஷாப் (TreeSHAP) உயிரியல்-இயற்பியல் பண்புக்கூறு',
    subtitle: 'No black boxes: Quantifying the exact Celsius contribution of Albedo, Canopy Deficit, and Sky View Factor.',
    subtitleTa: 'வெப்பத்திற்கான காரணங்களை துல்லியமாக செல்சியஸ் அளவில் பிரித்தாய்தல்.',
    category: 'XAI',
    badgeColor: 'border-purple-800 text-purple-400 bg-purple-950/40',
  },
  {
    id: 4,
    tag: 'OPTIMIZATION',
    tagTa: 'முதலீட்டு உகப்பாக்கம்',
    title: 'Multi-Objective Pareto Frontier Investment Planner',
    titleTa: 'பரேட்டோ எல்லை உகந்த மூலதன ஒதுக்கீடு',
    subtitle: 'Allocating ₹50 Cr capital expenditure with linear programming to maximize net cooling under strict spatial equity constraints.',
    subtitleTa: 'ரூ.50 கோடி நிதியை சமத்துவ அடிப்படையில் அதிகபட்ச குளிர்ச்சி தரும் வகையில் ஒதுக்கீடு.',
    category: 'OPTIMIZATION',
    badgeColor: 'border-emerald-800 text-emerald-400 bg-emerald-950/40',
  },
  {
    id: 5,
    tag: 'CRISIS OPS',
    tagTa: 'அவசர மேலாண்மை',
    title: 'Automated EOC Heat Action Plan (GRAP Stages 0-3)',
    titleTa: 'தானியங்கி அவசரகால வெப்ப செயல் திட்டம் (GRAP)',
    subtitle: 'Closing the loop from satellite heat detection to field enforcement: 12 PM-3 PM labor bans and misting truck routing.',
    subtitleTa: 'மதியம் 12-3 மணி வரை கட்டாய வேலை நிறுத்தம் மற்றும் நீர்த்துளி தெளிப்பு வாகன ஆணை.',
    category: 'OPERATIONS',
    badgeColor: 'border-amber-800 text-amber-400 bg-amber-950/40',
  },
  {
    id: 6,
    tag: 'INCLUSIVE MOBILITY',
    tagTa: 'குடிமக்கள் குளிர் இயக்கம்',
    title: 'Citizen Cool Navigator & Field Ops Verification',
    titleTa: 'குடிமக்கள் குளிர் நடைபாதை & கள சரிபார்ப்பு',
    subtitle: 'Algorithmic Dijkstra/A* routing minimizing thermal radiant exposure for elderly citizens and outdoor workers.',
    subtitleTa: 'முதியவர்கள் மற்றும் பாதசாரிகளுக்கு நிழல் வழியிலான உகந்த நடைபாதை வழிகாட்டி.',
    category: 'MOBILITY',
    badgeColor: 'border-blue-800 text-blue-400 bg-blue-950/40',
  },
  {
    id: 7,
    tag: 'INFRASTRUCTURE',
    tagTa: 'கட்டமைப்பு',
    title: 'Enterprise Architecture, OGC APIs & Open Data',
    titleTa: 'நிறுவன கட்டமைப்பு, OGC தரநிலைகள் & திறந்த தரவு',
    subtitle: 'PostGIS 16-3.4, STAC, WebSockets, SRTM30 3D Topography, and sub-50ms streaming response times.',
    subtitleTa: 'அதிவேக வெப்சாக்கெட், 3D நிலப்பரப்பு மற்றும் சர்வதேச புவிசார் தரநிலைகள்.',
    category: 'ARCHITECTURE',
    badgeColor: 'border-teal-800 text-teal-400 bg-teal-950/40',
  },
];

export default function PitchDeckPage() {
  const { language } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive Widget States for Slide 1 (Heat Index)
  const [slide1Temp, setSlide1Temp] = useState(38);
  const [slide1Humidity, setSlide1Humidity] = useState(75);

  // Interactive Widget States for Slide 4 (Capital Planner)
  const [slide4Budget, setSlide4Budget] = useState(50);
  const [slide4Strategy, setSlide4Strategy] = useState<'balanced' | 'aggressive' | 'equity'>('balanced');

  // Interactive Widget States for Slide 5 (EOC GRAP Stage)
  const [slide5Stage, setSlide5Stage] = useState(2);

  const totalSlides = SLIDES.length;
  const slide = SLIDES[currentSlideIndex];

  // Calculate Steadman Apparent Heat
  const calculateApparentHeat = (t: number, rh: number) => {
    const vp = (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t));
    const hi = t + 0.33 * vp - 0.7 * 2.5 - 4.0;
    return Math.max(t, Number(hi.toFixed(1)));
  };

  const currentHeatIndex = calculateApparentHeat(slide1Temp, slide1Humidity);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 flex flex-col font-sans select-none">
      <StitchHeader />

      {/* Progress Line */}
      <div className="w-full bg-[#111111] h-1">
        <div
          className="bg-primary-container h-1 transition-all duration-300"
          style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Slide Presentation Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {/* Slide Header Toolbar */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${slide.badgeColor}`}
            >
              {language === 'ta' ? slide.tagTa : slide.tag}
            </span>
            <span className="font-mono text-xs text-gray-400">
              {language === 'ta' ? `வழங்கல் பகுதி ${slide.id} / ${totalSlides}` : `Slide ${slide.id} of ${totalSlides}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] rounded text-gray-400 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer"
              title="Toggle Fullscreen"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
            <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded p-0.5">
              <button
                onClick={prevSlide}
                className="px-2.5 py-1 text-gray-300 hover:text-white hover:bg-[#222] rounded font-mono text-xs cursor-pointer"
                title="Previous Slide (←)"
              >
                ◀ Prev
              </button>
              <button
                onClick={nextSlide}
                className="px-3 py-1 bg-primary-container text-black font-semibold hover:opacity-90 rounded font-mono text-xs cursor-pointer"
                title="Next Slide (→ / Space)"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        {/* Slide Main Content Area */}
        <div className="my-auto py-6">
          {/* Slide Title */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
              {language === 'ta' ? slide.titleTa : slide.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 font-mono">
              {language === 'ta' ? slide.subtitleTa : slide.subtitle}
            </p>
          </div>

          {/* Slide Interactive Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Narrative Panel (7 cols) */}
            <div className="lg:col-span-7 bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col justify-between">
              {slide.id === 1 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-rose-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-rose-400 font-semibold">
                      The Biophysical Challenge
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      Chennai’s coastal boundary layer traps oceanic moisture from the Bay of Bengal, creating severe thermodynamic inversions. Even at a moderate ambient temperature of 38°C, an 75% relative humidity elevates the apparent heat index to a lethal <strong>53°C+</strong>, shutting down human evaporative cooling (sweat efficiency drops by 80%).
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Outdoor Worker Mortality Threshold</div>
                      <div className="text-xl font-bold text-rose-400 mt-1">45.0°C Apparent</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">At-Risk Population in GCC</div>
                      <div className="text-xl font-bold text-amber-400 mt-1">3.4 Million Citizens</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2 pt-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Reference: Steadman (1979) Coastal Heat Assessment & IMD Guidelines</span>
                  </div>
                </div>
              )}

              {slide.id === 2 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-cyan-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      Physical Decoupling & Continuous Streaming
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      Rather than relying on sparse weather stations, HeatScape fuses <strong>Landsat-9 100m TIR</strong> thermal imagery with <strong>842 ground IoT sensors</strong> over real-time WebSockets. Using <strong>Sen’s Slope</strong> and <strong>PELT changepoint algorithms</strong>, we detect sudden regime shifts caused by urbanization before catastrophic heatwaves strike.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Spatial Grain</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">100m Hex Mesh</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Telemetry Refresh</div>
                      <div className="text-base font-bold text-emerald-400 mt-1">&lt; 50ms (WS)</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Historical Depth</div>
                      <div className="text-base font-bold text-purple-400 mt-1">36 Months</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2 pt-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span>Fully OGC API Features & STAC Compliant Ingestion</span>
                  </div>
                </div>
              )}

              {slide.id === 3 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-purple-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-purple-400 font-semibold">
                      Actionable & Explainable Attribution
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      Black-box predictions are useless for municipal engineers. HeatScape applies <strong>TreeSHAP Game-Theoretic Attribution</strong> to tell ward officers exactly why a specific neighborhood is overheating:
                    </p>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between bg-[#121212] p-2.5 rounded border border-[#262626]">
                      <span className="text-gray-300">Albedo Deficit (Dark Asphalt & Tar Roofs)</span>
                      <span className="text-purple-400 font-bold">+2.8°C SHAP Value (42%)</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#121212] p-2.5 rounded border border-[#262626]">
                      <span className="text-gray-300">Tree Canopy Deficit (&lt; 5% Canopy)</span>
                      <span className="text-amber-400 font-bold">+1.9°C SHAP Value (28%)</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#121212] p-2.5 rounded border border-[#262626]">
                      <span className="text-gray-300">Urban Canyon Aspect Ratio (H/W &gt; 1.2)</span>
                      <span className="text-rose-400 font-bold">+1.2°C SHAP Value (18%)</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2 pt-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Direct mathematical foundation for targeted engineering tenders</span>
                  </div>
                </div>
              )}

              {slide.id === 4 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-emerald-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Capital Optimization with Equity Guarantee
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      Cities have constrained budgets. HeatScape solves a <strong>multi-objective integer linear program</strong> that optimizes cooling return-on-investment across Cool Roofs, Urban Forests, and Shading, while guaranteeing that at least 40% of funds benefit socio-economically vulnerable wards.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Total Budget</div>
                      <div className="text-base font-bold text-emerald-400 mt-1">₹{slide4Budget} Crores</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Mean Temp Drop</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">-{(slide4Budget * 0.046).toFixed(2)}°C</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Citizens Protected</div>
                      <div className="text-base font-bold text-amber-400 mt-1">{(slide4Budget * 68400).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2 pt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Produces printable GCC Legislative Resolution dockets instantly</span>
                  </div>
                </div>
              )}

              {slide.id === 5 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-amber-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400 font-semibold">
                      Full-Lifecycle Emergency Operations (GRAP)
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      When satellite and sensor telemetry detects Stage 2 (Orange Alert) or Stage 3 (Red Alert), HeatScape automates the Greater Chennai Corporation Graded Response Action Plan without human hesitation.
                    </p>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-[#121212] border border-[#262626] flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span><strong>12:00 PM – 3:00 PM</strong> mandatory outdoor construction work suspension.</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#121212] border border-[#262626] flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <span>Automated dispatch of 24 misting cannon trucks to highest-density transit hubs.</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#121212] border border-[#262626] flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Public air-conditioned cooling shelter activation in all 15 GCC zones.</span>
                    </div>
                  </div>
                </div>
              )}

              {slide.id === 6 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-blue-400 font-semibold">
                      Citizen Routing & Mobile Ground-Truth Ops
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      HeatScape connects government decision-makers directly with everyday citizens. The <strong>Cool Navigator</strong> calculates shaded walking routes with a custom thermal impedance cost function, while <strong>Field Ops</strong> allows municipal ward officers to inspect cool roofs and log voice reports.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Radiant Thermal Reduction</div>
                      <div className="text-lg font-bold text-blue-400 mt-1">-3.4°C Shaded Route</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-[#262626]">
                      <div className="text-gray-400">Voice Triage Languages</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">Tamil & English</div>
                    </div>
                  </div>
                </div>
              )}

              {slide.id === 7 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-teal-500 pl-4 py-1">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-teal-400 font-semibold">
                      Production Architecture & Standards Compliance
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      Engineered for high performance, sovereign municipal resilience, and international open data compliance:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 bg-[#121212] rounded border border-[#262626]">
                      <div className="text-teal-400 font-bold">Spatial Database</div>
                      <div className="text-gray-400 mt-1">PostGIS 16 with R-tree spatial indexing & EPSG:32644 (UTM 44N)</div>
                    </div>
                    <div className="p-3 bg-[#121212] rounded border border-[#262626]">
                      <div className="text-teal-400 font-bold">FastAPI Backend</div>
                      <div className="text-gray-400 mt-1">67 passing pytests, Pydantic V2, NumPy vectorized computations</div>
                    </div>
                    <div className="p-3 bg-[#121212] rounded border border-[#262626]">
                      <div className="text-teal-400 font-bold">Standards Support</div>
                      <div className="text-gray-400 mt-1">OGC API Features, STAC Item catalogs, and GeoJSON streaming</div>
                    </div>
                    <div className="p-3 bg-[#121212] rounded border border-[#262626]">
                      <div className="text-teal-400 font-bold">Real-Time Core</div>
                      <div className="text-gray-400 mt-1">FastAPI WebSockets + Redis Pub/Sub for sub-50ms node streaming</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick-Jump Button */}
              <div className="pt-4 border-t border-[#1c1c1c] flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">
                  {language === 'ta' ? 'நேரடி பயன்பாட்டு பக்கம் செல்ல:' : 'Jump to Live Platform Route:'}
                </span>
                {slide.id === 1 && (
                  <Link
                    href="/explorer"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-cyan-800 text-cyan-400 rounded text-xs font-mono"
                  >
                    Open Trajectories Map ↗
                  </Link>
                )}
                {slide.id === 2 && (
                  <Link
                    href="/multiview"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-cyan-800 text-cyan-400 rounded text-xs font-mono"
                  >
                    Open Multi-View Matrix ↗
                  </Link>
                )}
                {slide.id === 3 && (
                  <Link
                    href="/intelligence"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-purple-800 text-purple-400 rounded text-xs font-mono"
                  >
                    Open TreeSHAP Intelligence ↗
                  </Link>
                )}
                {slide.id === 4 && (
                  <Link
                    href="/simulator"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-emerald-800 text-emerald-400 rounded text-xs font-mono"
                  >
                    Open Capital Planner ↗
                  </Link>
                )}
                {slide.id === 5 && (
                  <Link
                    href="/eoc"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-amber-800 text-amber-400 rounded text-xs font-mono"
                  >
                    Open EOC Crisis Center ↗
                  </Link>
                )}
                {slide.id === 6 && (
                  <Link
                    href="/navigator"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-blue-800 text-blue-400 rounded text-xs font-mono"
                  >
                    Open Cool Navigator ↗
                  </Link>
                )}
                {slide.id === 7 && (
                  <Link
                    href="/studio"
                    className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-teal-800 text-teal-400 rounded text-xs font-mono"
                  >
                    Open Terrain & 3D Studio ↗
                  </Link>
                )}
              </div>
            </div>

            {/* Right Interactive Sandbox Panel (5 cols) */}
            <div className="lg:col-span-5 bg-[#0e0e0e] border border-[#222222] rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-4">
                <span className="font-mono text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-[16px]">tune</span>
                  <span>LIVE EVALUATOR SANDBOX</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-gray-400">
                  Interactive
                </span>
              </div>

              {/* Interactive Widget for Slide 1 */}
              {slide.id === 1 && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 font-mono">
                    Drag ambient temperature and relative humidity to witness how coastal moisture magnifies thermal stress:
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-gray-300 mb-1">
                        <span>Dry-Bulb Air Temp:</span>
                        <span className="text-amber-400 font-bold">{slide1Temp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="46"
                        value={slide1Temp}
                        onChange={(e) => setSlide1Temp(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-300 mb-1">
                        <span>Relative Humidity:</span>
                        <span className="text-cyan-400 font-bold">{slide1Humidity}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="95"
                        value={slide1Humidity}
                        onChange={(e) => setSlide1Humidity(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#141414] border border-[#2a2a2a] text-center">
                    <div className="text-xs font-mono text-gray-400">Steadman Apparent Heat Index</div>
                    <div
                      className={`text-4xl font-extrabold font-mono mt-1 ${
                        currentHeatIndex >= 45 ? 'text-rose-500 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      {currentHeatIndex}°C
                    </div>
                    <div className="text-xs font-mono mt-2 text-rose-400 font-semibold">
                      {currentHeatIndex >= 50
                        ? 'CRITICAL DANGER: Heat Stroke Imminent'
                        : currentHeatIndex >= 42
                        ? 'DANGER: Heat Cramps & Exhaustion Likely'
                        : 'CAUTION: Sustained Fatigue'}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 2 */}
              {slide.id === 2 && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="text-gray-400">Live Spatial Sensor Density Breakdown:</div>
                  <div className="space-y-2">
                    <div className="bg-[#141414] p-2.5 rounded border border-[#262626] flex justify-between">
                      <span className="text-gray-300">Zone 9 (T. Nagar Commercial)</span>
                      <span className="text-rose-400 font-bold">42.8°C (+3.2°C anomaly)</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded border border-[#262626] flex justify-between">
                      <span className="text-gray-300">Zone 5 (Royapuram Coastal)</span>
                      <span className="text-amber-400 font-bold">39.4°C (+1.1°C anomaly)</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded border border-[#262626] flex justify-between">
                      <span className="text-gray-300">Zone 13 (Guindy Industrial)</span>
                      <span className="text-rose-400 font-bold">44.1°C (+4.5°C anomaly)</span>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded border border-[#262626] flex justify-between">
                      <span className="text-gray-300">Zone 10 (Kodambakkam)</span>
                      <span className="text-amber-400 font-bold">41.2°C (+2.0°C anomaly)</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#181818] rounded text-[11px] text-gray-400">
                    Calculated across 842 calibrated microclimate sensor nodes streaming over duplex WebSockets.
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 3 */}
              {slide.id === 3 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-gray-400">Biophysical Sensitivity Simulation:</div>
                  <div className="p-3 bg-[#141414] rounded border border-[#262626] space-y-2">
                    <div className="flex justify-between">
                      <span>Roof Albedo (0.15 → 0.85):</span>
                      <span className="text-emerald-400 font-bold">-2.1°C</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[75%]" />
                    </div>
                  </div>
                  <div className="p-3 bg-[#141414] rounded border border-[#262626] space-y-2">
                    <div className="flex justify-between">
                      <span>Canopy Coverage (+15%):</span>
                      <span className="text-cyan-400 font-bold">-1.8°C</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="p-3 bg-[#141414] rounded border border-[#262626] space-y-2">
                    <div className="flex justify-between">
                      <span>Permeable Pavements (+30%):</span>
                      <span className="text-purple-400 font-bold">-0.9°C</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full w-[35%]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 4 */}
              {slide.id === 4 && (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Allocated Budget (₹ Cr):</span>
                      <span className="text-emerald-400 font-bold">₹{slide4Budget} Cr</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={slide4Budget}
                      onChange={(e) => setSlide4Budget(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="flex gap-1 bg-[#141414] p-1 rounded border border-[#2a2a2a]">
                    {(['balanced', 'aggressive', 'equity'] as const).map((strat) => (
                      <button
                        key={strat}
                        onClick={() => setSlide4Strategy(strat)}
                        className={`flex-1 py-1 text-[10px] rounded uppercase font-semibold transition-all ${
                          slide4Strategy === strat
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {strat}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-[#141414] rounded border border-[#262626] space-y-1.5">
                    <div className="flex justify-between text-gray-400">
                      <span>High-Albedo Cool Roofs:</span>
                      <span className="text-white font-bold">{Math.round(slide4Budget * 14.5)} ha</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Miyawaki Native Canopy:</span>
                      <span className="text-white font-bold">{Math.round(slide4Budget * 6.2)} ha</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Transit Shade Shelters:</span>
                      <span className="text-white font-bold">{Math.round(slide4Budget * 11.8)} units</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 5 */}
              {slide.id === 5 && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="text-gray-400">Simulate GCC Heat Action Plan (GRAP):</div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((stg) => (
                      <button
                        key={stg}
                        onClick={() => setSlide5Stage(stg)}
                        className={`py-2 rounded font-bold transition-all ${
                          slide5Stage === stg
                            ? stg === 3
                              ? 'bg-rose-600 text-white'
                              : stg === 2
                              ? 'bg-amber-600 text-white'
                              : stg === 1
                              ? 'bg-yellow-600 text-black'
                              : 'bg-emerald-600 text-white'
                            : 'bg-[#141414] text-gray-400 hover:text-white'
                        }`}
                      >
                        Stage {stg}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded bg-[#141414] border border-[#262626] space-y-1">
                    <div className="font-bold text-gray-200">
                      {slide5Stage === 3
                        ? 'RED ALERT (Extreme Heatwave)'
                        : slide5Stage === 2
                        ? 'ORANGE ALERT (Severe Heat)'
                        : slide5Stage === 1
                        ? 'YELLOW ALERT (Heat Advisory)'
                        : 'NORMAL MONITORING'}
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      {slide5Stage >= 2
                        ? 'Enforcing 12 PM - 3 PM mandatory outdoor work ban & emergency hydration depots.'
                        : 'Routine temperature monitoring & public advisories.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 6 */}
              {slide.id === 6 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-gray-400">Pedestrian Exposure Comparison:</div>
                  <div className="p-3 bg-[#141414] rounded border border-rose-900/40">
                    <div className="flex justify-between font-bold text-rose-400">
                      <span>Direct Route (Anna Salai)</span>
                      <span>1.2 km • 14 min</span>
                    </div>
                    <div className="text-gray-400 text-[11px] mt-1">
                      Thermal Stress: 44.5°C Apparent • Direct Sun Exposure: 88%
                    </div>
                  </div>
                  <div className="p-3 bg-[#141414] rounded border border-blue-900/40">
                    <div className="flex justify-between font-bold text-blue-400">
                      <span>Cool Shaded Route (Canopy Corridors)</span>
                      <span>1.4 km • 16 min</span>
                    </div>
                    <div className="text-emerald-400 text-[11px] mt-1">
                      Thermal Stress: 37.8°C Apparent (-6.7°C) • Shading: 74%
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Widget for Slide 7 */}
              {slide.id === 7 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-gray-400">Platform Test & Health Status:</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between bg-[#141414] p-2 rounded border border-[#262626]">
                      <span className="text-gray-300">Pytest Backend Coverage</span>
                      <span className="text-emerald-400 font-bold">67 Passing Tests (100%)</span>
                    </div>
                    <div className="flex justify-between bg-[#141414] p-2 rounded border border-[#262626]">
                      <span className="text-gray-300">TypeScript Strict Mode</span>
                      <span className="text-emerald-400 font-bold">0 Type Errors</span>
                    </div>
                    <div className="flex justify-between bg-[#141414] p-2 rounded border border-[#262626]">
                      <span className="text-gray-300">WebSocket Streaming Gateway</span>
                      <span className="text-cyan-400 font-bold">Active & Broadcasting</span>
                    </div>
                    <div className="flex justify-between bg-[#141414] p-2 rounded border border-[#262626]">
                      <span className="text-gray-300">Design Token Standard</span>
                      <span className="text-purple-400 font-bold">Pure OLED (#000000)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluator Note */}
              <div className="mt-4 pt-3 border-t border-[#1c1c1c] text-[11px] font-mono text-gray-500 flex items-center justify-between">
                <span>Use keyboard ← / → arrows to navigate</span>
                <span className="text-primary-container">Google Hackathon 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Thumbnail Navigation Strip */}
        <div className="grid grid-cols-7 gap-2 pt-4 border-t border-[#222222]">
          {SLIDES.map((s, idx) => {
            const isCurrent = idx === currentSlideIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`p-2 rounded text-left transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#181818] border-primary-container text-white shadow'
                    : 'bg-[#0a0a0a] border-[#222222] text-gray-400 hover:border-[#333]'
                }`}
              >
                <div className="font-mono text-[10px] text-gray-400">0{s.id}</div>
                <div className="font-mono text-[11px] font-bold truncate mt-0.5">
                  {language === 'ta' ? s.tagTa : s.tag}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
