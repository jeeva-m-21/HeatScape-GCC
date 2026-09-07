'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  commandCenter: string;
  trajectories: string;
  multiView: string;
  planner: string;
  impactMRV: string;
  intelligence: string;
  eocCrisis: string;
  coolNavigator: string;
  studioTerrain: string;
  fieldOps: string;
  pitchDeck: string;
  judgeTour: string;
  landsatLive: string;
  sensorsActive: string;
  liveTelemetry: string;
  grapStage2Notice: string;
  outdoorWorkBan: string;
  mistingCannons: string;
  coolingRefuge: string;
  apparentHeatIndex: string;
  highAlbedoRoofs: string;
  nativeUrbanForest: string;
  transitShading: string;
  emergencyIntake: string;
  copilotTitle: string;
  copilotSubtitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'HEATSCAPE',
    appSubtitle: 'Spatiotemporal Urban Heat Intelligence',
    commandCenter: 'Command Center',
    trajectories: 'Trajectories',
    multiView: 'Multi-View',
    planner: 'Planner',
    impactMRV: 'Impact MRV',
    intelligence: 'Intelligence',
    eocCrisis: 'EOC Crisis',
    coolNavigator: 'Cool Navigator',
    studioTerrain: 'Studio & Terrain',
    fieldOps: 'Field Ops',
    pitchDeck: 'Pitch Deck',
    judgeTour: 'Judge Tour',
    landsatLive: 'Landsat-9 • Live',
    sensorsActive: '842 Sensors Active',
    liveTelemetry: 'IoT Telemetry Live',
    grapStage2Notice: 'GRAP STAGE 2 (ORANGE ALERT) MANDATORY ADVISORY IN EFFECT',
    outdoorWorkBan: 'Mandatory outdoor labor suspension between 12:00 PM and 3:00 PM across all GCC public and private construction sites.',
    mistingCannons: 'Evaporative Misting Cannon Fleet Mobilized',
    coolingRefuge: 'Public Air-Conditioned Cooling Shelters Active',
    apparentHeatIndex: 'Steadman Apparent Heat Index',
    highAlbedoRoofs: 'High-Albedo Cool Roof Coating',
    nativeUrbanForest: 'Native Miyawaki & Urban Forest Canopy',
    transitShading: 'Transit Hub Modular Shading & Misting',
    emergencyIntake: 'Emergency Heat Incident Intake',
    copilotTitle: 'CHENNAI HEAT COPILOT',
    copilotSubtitle: 'Natural Language Spatial Query & GCC GRAP Policy Engine',
  },
  ta: {
    appName: 'ஹீட்ஸ்கேப்',
    appSubtitle: 'பெருநகர சென்னை மாநகராட்சி வெப்ப நுண்ணறிவு தளம்',
    commandCenter: 'கட்டளை மையம்',
    trajectories: 'வெப்பப் பாதைகள்',
    multiView: 'பல்நோக்கு பார்வை',
    planner: 'குளிர்விப்பு திட்டம்',
    impactMRV: 'தாக்கக் கண்காணிப்பு',
    intelligence: 'நகர நுண்ணறிவு',
    eocCrisis: 'அவசர கட்டுப்பாட்டு அறை',
    coolNavigator: 'குளிர் நடைபாதை வழிகாட்டி',
    studioTerrain: 'நிலப்பரப்பு & ஆய்வகம்',
    fieldOps: 'களப்பணி & குரல் அவசரம்',
    pitchDeck: 'திட்ட விளக்கக்காட்சி',
    judgeTour: 'நடுவர் சுற்றுப்பயணம்',
    landsatLive: 'லேண்ட்சாட்-9 • நேரலை',
    sensorsActive: '842 உணரிகள் இயங்குகின்றன',
    liveTelemetry: 'IoT தொலைநிலை நேரலை',
    grapStage2Notice: 'GRAP நிலை 2 (ஆரஞ்சு எச்சரிக்கை) கட்டாய ஆணை அமலில் உள்ளது',
    outdoorWorkBan: 'பிற்பகல் 12:00 மணி முதல் 3:00 மணி வரை அனைத்து வெளிப்புற கட்டுமானப் பணிகளையும் கட்டாயமாக நிறுத்த வேண்டும்.',
    mistingCannons: 'நீர்த்துளி தெளிக்கும் வாகனங்கள் தயார் நிலையில் உள்ளன',
    coolingRefuge: 'குளிரூட்டப்பட்ட பொது புகலிடங்கள் செயல்படுகின்றன',
    apparentHeatIndex: 'ஸ்டெட்மேன் வெளிப்படையான வெப்பக் குறியீடு',
    highAlbedoRoofs: 'வெப்பம் பிரதிபலிக்கும் கூரை பூச்சு',
    nativeUrbanForest: 'பாரம்பரிய நகர்ப்புற காடுகள் வளர்ப்பு',
    transitShading: 'பேருந்து நிறுத்த நிழற்கூரைகள் & நீர் தெளிப்பான்',
    emergencyIntake: 'அவசர வெப்ப துயர் பதிவு',
    copilotTitle: 'சென்னை வெப்ப வழிகாட்டி AI',
    copilotSubtitle: 'இயற்கை மொழி வினவல் & மாநகராட்சி வழிகாட்டி இயந்திரம்',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('heatscape_language') as Language;
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('heatscape_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
