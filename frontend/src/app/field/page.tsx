'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { HeatIncident, FieldAudit } from '@/lib/types';
import { useSpeech } from '@/lib/use-speech';

type FieldTab = 'kanban' | 'voice-intake' | 'verification-audit';

export default function FieldOfficerPage() {
  const { speak, stop, isSpeaking } = useSpeech();
  const [activeTab, setActiveTab] = useState<FieldTab>('kanban');

  // Incidents State
  const [incidents, setIncidents] = useState<HeatIncident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  // Voice Intake State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [detectedCategory, setDetectedCategory] = useState('MISTING_REQUIRED');
  const [detectedLocation, setDetectedLocation] = useState('Usman Road, T. Nagar');
  const [detectedWard, setDetectedWard] = useState('117');
  const [detectedSeverity, setDetectedSeverity] = useState<'CRITICAL' | 'URGENT' | 'MODERATE'>('CRITICAL');
  const [isSubmittingVoice, setIsSubmittingVoice] = useState(false);
  const [voiceSuccessMsg, setVoiceSuccessMsg] = useState('');

  // Audit Logs State
  const [audits, setAudits] = useState<FieldAudit[]>([]);
  const [auditorName, setAuditorName] = useState('Inspector M. Senthamil');
  const [auditWard, setAuditWard] = useState('117');
  const [auditIntervention, setAuditIntervention] = useState('COOL_ROOF');
  const [auditSite, setAuditSite] = useState('T. Nagar Municipal Market Rooftop');
  const [auditAlbedo, setAuditAlbedo] = useState(0.82);
  const [auditSurvival, setAuditSurvival] = useState(92);
  const [auditCondition, setAuditCondition] = useState<'OPTIMAL' | 'NEEDS_ATTENTION' | 'CRITICAL_DEGRADATION'>('OPTIMAL');
  const [auditNotes, setAuditNotes] = useState('Reflective coating intact; infrared surface temperature shows 11.5°C cooling relief over untreated asphalt.');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  const [auditSuccessMsg, setAuditSuccessMsg] = useState('');

  useEffect(() => {
    loadIncidents();
    loadAudits();
  }, []);

  const loadIncidents = async () => {
    setIsLoadingIncidents(true);
    try {
      const res = await apiClient.getIncidents();
      setIncidents(res.incidents);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  const loadAudits = async () => {
    try {
      const res = await apiClient.getFieldAudits();
      setAudits(res.audits);
    } catch (err) {
      console.error('Failed to load audits:', err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await apiClient.updateIncidentStatus(id, newStatus);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Voice Simulation
  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceTranscript('Listening... Speak into microphone');
      setVoiceSuccessMsg('');
      setTimeout(() => {
        setVoiceTranscript(
          'Emergency report from T. Nagar Usman Road flyover junction. Roadside vendors and bus passengers experiencing severe heat dizziness. Ambient temp is 44°C under intense radiant entrapment. Request immediate misting cannon truck and hydration support.'
        );
        setDetectedCategory('MISTING_REQUIRED');
        setDetectedLocation('Usman Road Flyover Junction, T. Nagar');
        setDetectedWard('117');
        setDetectedSeverity('CRITICAL');
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmitVoiceIncident = async () => {
    setIsSubmittingVoice(true);
    try {
      const newInc = await apiClient.reportIncident({
        reporter_name: 'Citizen / Voice Dispatch',
        category: detectedCategory,
        location_name: detectedLocation,
        description: voiceTranscript,
        ward_id: detectedWard,
        severity: detectedSeverity,
      });
      setIncidents((prev) => [newInc, ...prev]);
      setVoiceSuccessMsg(`Emergency Incident ${newInc.id} dispatched successfully! ETA: ${newInc.eta_minutes} mins.`);
      setVoiceTranscript('');
    } catch (err) {
      console.error('Failed to submit voice incident:', err);
    } finally {
      setIsSubmittingVoice(false);
    }
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAudit(true);
    try {
      const newAudit = await apiClient.logFieldAudit({
        auditor_name: auditorName,
        ward_id: auditWard,
        intervention_type: auditIntervention,
        site_name: auditSite,
        condition: auditCondition,
        notes: auditNotes,
        verified_albedo: auditIntervention === 'COOL_ROOF' ? auditAlbedo : undefined,
        survival_rate_pct: auditIntervention === 'URBAN_CANOPY' ? auditSurvival : undefined,
      });
      setAudits((prev) => [newAudit, ...prev]);
      setAuditSuccessMsg(`Field Verification Audit ${newAudit.audit_id} recorded in GCC MRV ledger!`);
    } catch (err) {
      console.error('Failed to submit audit:', err);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  const reportedIncidents = incidents.filter((i) => i.status === 'REPORTED');
  const dispatchedIncidents = incidents.filter((i) => i.status === 'DISPATCHED');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED');

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 font-sans">
      {/* Field Command Ribbon */}
      <section className="bg-[#0a0a0a] border-b border-[#222222] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-semibold">
                GCC FIELD OFFICER &amp; VOICE DISPATCH
              </span>
              <span className="text-xs text-gray-500 font-mono">15 Zonal Health Offices Connected</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">badge</span>
              Field Emergency Operations &amp; Verification Suite
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'kanban'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_kanban</span>
              <span>Incident Triage ({incidents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('voice-intake')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'voice-intake'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">mic</span>
              <span>Voice Intake</span>
            </button>
            <button
              onClick={() => setActiveTab('verification-audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'verification-audit'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">fact_check</span>
              <span>Intervention Audits ({audits.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: INCIDENT TRIAGE KANBAN */}
        {/* ========================================================================= */}
        {activeTab === 'kanban' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Explanatory Header */}
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">local_shipping</span>
                  Active Heatwave Incident Triage &amp; Rapid Unit Dispatch
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Real-time pipeline routing citizen distress calls (1913 toll-free) and field officer reports to nearest misting cannon trucks, potable water tankers, and 108 mobile medical ICUs.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('voice-intake')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Report Voice Incident</span>
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: REPORTED */}
              <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>1. REPORTED IN QUEUE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#161616] text-amber-400 font-mono text-xs font-bold">
                    {reportedIncidents.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {reportedIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-xl bg-[#121212] border border-[#262626] font-mono text-xs space-y-2 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{inc.id} • Ward {inc.ward_id}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-xs">{inc.location_name}</div>
                        <button
                          onClick={() => {
                            if (isSpeaking) {
                              stop();
                            } else {
                              const msg = `Incident ${inc.id} reported at ${inc.location_name}. Description: ${inc.description}. Caller is ${inc.reporter_name}.`;
                              speak(msg, 'en');
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                          title="Listen to incident dispatch"
                        >
                          <span className="material-symbols-outlined text-[14px]">volume_up</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{inc.description}</p>
                      <div className="text-[10px] text-gray-500">Caller: {inc.reporter_name}</div>
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'DISPATCHED')}
                        className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/60 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>Dispatch Response Unit</span>
                      </button>
                    </div>
                  ))}
                  {reportedIncidents.length === 0 && (
                    <div className="text-center py-12 text-gray-600 font-mono text-xs">
                      No pending incidents in queue.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: DISPATCHED */}
              <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>2. UNITS DISPATCHED &amp; EN ROUTE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#161616] text-cyan-400 font-mono text-xs font-bold">
                    {dispatchedIncidents.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {dispatchedIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-xl bg-[#121212] border border-cyan-800/40 font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{inc.id} • Ward {inc.ward_id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                          ETA {inc.eta_minutes}m
                        </span>
                      </div>
                      <div className="font-bold text-white text-xs">{inc.location_name}</div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{inc.description}</p>
                      <div className="p-2 rounded bg-[#181818] border border-[#262626] text-[10px] text-cyan-300 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">alt_route</span>
                        <span>{inc.dispatched_unit}</span>
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                        className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/60 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Mark Incident Resolved</span>
                      </button>
                    </div>
                  ))}
                  {dispatchedIncidents.length === 0 && (
                    <div className="text-center py-12 text-gray-600 font-mono text-xs">
                      No units currently deployed.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: RESOLVED */}
              <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>3. RESOLVED &amp; VERIFIED</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#161616] text-emerald-400 font-mono text-xs font-bold">
                    {resolvedIncidents.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {resolvedIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-xl bg-[#0e0e0e] border border-emerald-900/40 font-mono text-xs space-y-2 opacity-80"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{inc.id} • Ward {inc.ward_id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          RESOLVED
                        </span>
                      </div>
                      <div className="font-bold text-gray-300 text-xs">{inc.location_name}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{inc.description}</p>
                      <div className="text-[10px] text-gray-600">Unit: {inc.dispatched_unit}</div>
                    </div>
                  ))}
                  {resolvedIncidents.length === 0 && (
                    <div className="text-center py-12 text-gray-600 font-mono text-xs">
                      Resolved incidents will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VOICE EMERGENCY INTAKE SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'voice-intake' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-6">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">graphic_eq</span>
                Citizen Voice Incident Intake &amp; Natural Language Dispatch
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Simulates voice emergency reporting via telephone dispatch (1913) or field mobile app.
                Automatically transcribes spoken Tamil/English audio, extracts coordinates, identifies heat distress severity, and mobilizes municipal emergency units.
              </p>
            </div>

            {/* Recording Console */}
            <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <button
                  onClick={handleToggleRecord}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.6)]'
                      : 'bg-[#181818] border border-[#333333] hover:border-amber-400 text-amber-400 hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined text-[42px]">
                    {isRecording ? 'mic' : 'mic_none'}
                  </span>
                </button>
              </div>

              <div>
                <div className="font-mono text-sm font-bold text-white">
                  {isRecording ? 'Capturing Spoken Emergency Audio...' : 'Click to Speak Incident Report'}
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  Supports automated Tamil &amp; English Chennai colloquial terms
                </div>
              </div>

              {/* Audio Waveform Simulation */}
              {isRecording && (
                <div className="flex items-center gap-1.5 h-8">
                  {[40, 75, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 35].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1 bg-red-400 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Transcription & Auto-Parsed Entity Cards */}
            {voiceTranscript && (
              <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-6 space-y-5 animate-fadeIn font-mono">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Transcribed Voice Stream</div>
                  <div className="p-4 rounded-xl bg-[#050505] border border-[#262626] text-xs text-gray-200 leading-relaxed">
                    &ldquo;{voiceTranscript}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                    <div className="text-gray-500 text-[10px]">Identified Category</div>
                    <div className="text-amber-400 font-bold mt-1">{detectedCategory}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                    <div className="text-gray-500 text-[10px]">Extracted Location</div>
                    <div className="text-white font-bold mt-1">{detectedLocation}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                    <div className="text-gray-500 text-[10px]">Geocoded Ward</div>
                    <div className="text-cyan-400 font-bold mt-1">Ward {detectedWard} (Zone X)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                    <div className="text-gray-500 text-[10px]">Triage Priority</div>
                    <div className="text-red-400 font-bold mt-1">{detectedSeverity}</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitVoiceIncident}
                  disabled={isSubmittingVoice}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-black font-mono text-xs font-bold rounded-xl transition-all shadow-[0_2px_15px_rgba(243,128,32,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isSubmittingVoice ? 'Dispatching Emergency Unit...' : 'Confirm & Dispatch Emergency Units'}</span>
                </button>

                {voiceSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{voiceSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FIELD OFFICER INTERVENTION VERIFICATION AUDITS */}
        {/* ========================================================================= */}
        {activeTab === 'verification-audit' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">fact_check</span>
                  In-Situ Physical Intervention Verification Audits
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enables GCC ward sanitary inspectors and civil engineers to verify physical performance metrics: cool roof solar reflectance degradation, urban canopy tree sapling survival rates, and cooling shelter temperature depression.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form to log new audit */}
              <div className="lg:col-span-5 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 space-y-4 font-mono text-xs">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block border-b border-[#222222] pb-2">
                  Submit On-Site Verification Audit
                </span>

                <form onSubmit={handleSubmitAudit} className="space-y-4">
                  <div>
                    <label className="text-gray-400 block mb-1">Auditor Name &amp; Designation:</label>
                    <input
                      type="text"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">Ward ID:</label>
                      <input
                        type="text"
                        value={auditWard}
                        onChange={(e) => setAuditWard(e.target.value)}
                        className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Intervention Type:</label>
                      <select
                        value={auditIntervention}
                        onChange={(e) => setAuditIntervention(e.target.value)}
                        className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400"
                      >
                        <option value="COOL_ROOF">Cool Roof Coating</option>
                        <option value="URBAN_CANOPY">Native Urban Forestry</option>
                        <option value="SHADE_CANOPY">Transit Shading</option>
                        <option value="COOL_PAVEMENT">Reflective Pavement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Site / Facility Name:</label>
                    <input
                      type="text"
                      value={auditSite}
                      onChange={(e) => setAuditSite(e.target.value)}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  {auditIntervention === 'COOL_ROOF' ? (
                    <div>
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>Measured Solar Reflectance (Albedo):</span>
                        <span className="text-white font-bold">{auditAlbedo.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={0.95}
                        step={0.01}
                        value={auditAlbedo}
                        onChange={(e) => setAuditAlbedo(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  ) : auditIntervention === 'URBAN_CANOPY' ? (
                    <div>
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>Sapling Survival Rate (%):</span>
                        <span className="text-white font-bold">{auditSurvival}%</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={100}
                        step={1}
                        value={auditSurvival}
                        onChange={(e) => setAuditSurvival(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="text-gray-400 block mb-1">Physical Condition Rating:</label>
                    <select
                      value={auditCondition}
                      onChange={(e: any) => setAuditCondition(e.target.value)}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400"
                    >
                      <option value="OPTIMAL">OPTIMAL (Full cooling delivery)</option>
                      <option value="NEEDS_ATTENTION">NEEDS ATTENTION (Minor maintenance needed)</option>
                      <option value="CRITICAL_DEGRADATION">CRITICAL DEGRADATION (Re-coating / Replating required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Field Observations &amp; Thermal Notes:</label>
                    <textarea
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-[#121212] border border-[#262626] rounded-lg p-2 text-white outline-none focus:border-amber-400 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAudit}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{isSubmittingAudit ? 'Submitting to GCC MRV...' : 'Log Field Audit to Ledger'}</span>
                  </button>

                  {auditSuccessMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs">
                      {auditSuccessMsg}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Historical Audit Logs */}
              <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Recent Verification Audits ({audits.length})
                  </span>
                  <span className="text-[10px] text-gray-500">GCC Zonal Verification Log</span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[520px]">
                  {audits.map((a) => (
                    <div
                      key={a.audit_id}
                      className="p-3.5 rounded-xl bg-[#121212] border border-[#242424] space-y-2 hover:border-emerald-800/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{a.audit_id}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-300 font-bold">{a.site_name}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            a.condition === 'OPTIMAL'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {a.condition}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span>Ward: {a.ward_id}</span>
                        <span>Type: {a.intervention_type}</span>
                        {a.verified_albedo !== undefined && (
                          <span className="text-cyan-400 font-bold">Albedo: {a.verified_albedo}</span>
                        )}
                        {a.survival_rate_pct !== undefined && (
                          <span className="text-emerald-400 font-bold">Survival: {a.survival_rate_pct}%</span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-300 leading-relaxed bg-[#0a0a0a] p-2 rounded-lg border border-[#1e1e1e]">
                        {a.notes}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <span>Inspector: {a.auditor_name}</span>
                        <span>{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
