'use client';

import React from 'react';
import Link from 'next/link';

export default function StitchGalleryPage() {
  const stitchScreens = [
    {
      title: 'HeatScape - Modern Urban Cooling Intelligence',
      screenId: 'c2c3b5a61f2f4873976083b70a2bb5e3',
      slug: '06_modern_urban_cooling_intelligence',
      description: 'Executive Overview, Hero Telemetry Strip, Methodology, and Regional Status Badges.',
      image: '/stitch/06_modern_urban_cooling_intelligence.png',
      liveLink: '/',
    },
    {
      title: 'HeatScape - Clean Trajectory Explorer',
      screenId: '757fd42c1a0e4f9e9cab00350f868727',
      slug: '02_clean_trajectory_explorer',
      description: 'Full-screen WebGL and SVG Spatial Grid, State Filter, Legend, and Diagnostic Drawer.',
      image: '/stitch/02_clean_trajectory_explorer.png',
      liveLink: '/explorer',
    },
    {
      title: 'HeatScape - Clean Cooling Scenario Planner',
      screenId: '50179572c6f74376a946be5d6ee6e206',
      slug: '01_clean_cooling_scenario_planner',
      description: 'Interactive Capex Budget Slider, Mode Toggle, and OR-Tools MILP Allocation Matrix.',
      image: '/stitch/01_clean_cooling_scenario_planner.png',
      liveLink: '/simulator',
    },
    {
      title: 'HeatScape - Multi-View Thermal & Street Map Explorer',
      screenId: '889a26e9df0a44229ea47f0a7b42c6e1',
      slug: '03_multi_view_thermal_street_map',
      description: 'Split cartographic view comparing surface LST satellite thermal contours with street vector grids.',
      image: '/stitch/03_multi_view_thermal_street_map.png',
      liveLink: '/explorer',
    },
    {
      title: 'HeatScape - Post-Intervention Impact & Monitoring',
      screenId: 'b0ae3d334eaa45dc8c939d64d3b6ec90',
      slug: '05_post_intervention_impact_monitoring',
      description: 'Pre vs post cooling verification, sensor compliance logs, and feedback loops.',
      image: '/stitch/05_post_intervention_impact_monitoring.png',
      liveLink: '/monitoring',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-canvas bg-grid-pattern p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1E293B] border border-[#334155] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 border border-accent/40 text-accent font-mono text-[10px] font-bold uppercase">
                Design System & Screen Gallery
              </span>
              <span className="text-slate-400 font-mono text-xs">
                Google Stitch Project ID: 15139587154950123034
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono text-white mt-1">
              Stitch Production Reference Gallery // HeatScape
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              High-fidelity prototype screens and design system tokens extracted via Model Context Protocol (MCP).
            </p>
          </div>

          <div className="px-3 py-1.5 bg-[#182234] border border-[#334155] font-mono text-xs text-slate-300">
            Design Tokens: <span className="text-accent font-bold">Fidelity Mode</span>
          </div>
        </div>

        {/* Design System Tokens Summary */}
        <div className="bg-[#1E293B] border border-[#334155] p-4">
          <div className="text-xs uppercase font-mono font-bold text-slate-400 mb-3">
            Core Design System Tokens (Stitch Assets c7789820...)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#182234] p-3 border border-[#334155] flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#F38020] border border-white/20" />
              <div>
                <div className="text-xs font-mono font-bold text-white">#F38020</div>
                <div className="text-[10px] text-slate-400">Primary Accent</div>
              </div>
            </div>

            <div className="bg-[#182234] p-3 border border-[#334155] flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#10B981] border border-white/20" />
              <div>
                <div className="text-xs font-mono font-bold text-white">#10B981</div>
                <div className="text-[10px] text-slate-400">Secondary Emerald</div>
              </div>
            </div>

            <div className="bg-[#182234] p-3 border border-[#334155] flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#D97706] border border-white/20" />
              <div>
                <div className="text-xs font-mono font-bold text-white">#D97706</div>
                <div className="text-[10px] text-slate-400">Tertiary Amber</div>
              </div>
            </div>

            <div className="bg-[#182234] p-3 border border-[#334155] flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#64748B] border border-white/20" />
              <div>
                <div className="text-xs font-mono font-bold text-white">#64748B</div>
                <div className="text-[10px] text-slate-400">Neutral Slate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stitchScreens.map((sc, idx) => (
            <div key={idx} className="bg-[#1E293B] border border-[#334155] overflow-hidden flex flex-col justify-between group hover:border-accent transition-colors">
              <div>
                <div className="relative aspect-video bg-black/50 overflow-hidden border-b border-[#334155]">
                  <img
                    src={sc.image}
                    alt={sc.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur font-mono text-[9px] text-slate-300 border border-white/10">
                    Stitch {idx + 1}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-mono text-sm font-bold text-white line-clamp-1">{sc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    ID: {sc.screenId}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <Link
                  href={sc.liveLink}
                  className="flex-1 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-mono text-center font-bold transition-colors"
                >
                  View Live UI →
                </Link>
                <a
                  href={sc.image}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#182234] hover:bg-slate-800 text-slate-300 border border-[#334155] text-xs font-mono transition-colors"
                >
                  Raw PNG
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
