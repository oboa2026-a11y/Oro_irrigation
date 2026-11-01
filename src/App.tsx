/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DashboardTab,
  Language,
  ZoneRecord,
  IrrigationScheme,
} from './types';
import {
  loadSavedZones,
  loadSavedSchemes,
  saveZonesToStorage,
  saveSchemesToStorage,
} from './data/initialData';
import { translations, getTranslation } from './data/translations';

// Dashboard Components
import { MobilizationDashboard } from './components/dashboards/MobilizationDashboard';
import { ExecutiveKpis } from './components/dashboards/ExecutiveKpis';
import { RegionalExecutiveDashboard } from './components/dashboards/RegionalExecutiveDashboard';
import { AreaCoverageDashboard } from './components/dashboards/AreaCoverageDashboard';
import { InputSupplyDashboard } from './components/dashboards/InputSupplyDashboard';
import { IrrigationInfraDashboard } from './components/dashboards/IrrigationInfraDashboard';
import { OromiaGisMap } from './components/gis/OromiaGisMap';
import { MechanizationDemographicsDashboard } from './components/dashboards/MechanizationDemographicsDashboard';
import { ClusterAndInvestorDashboard } from './components/dashboards/ClusterAndInvestorDashboard';
import { CropProtectionConditionDashboard } from './components/dashboards/CropProtectionConditionDashboard';
import { HarvestMarketingDashboard } from './components/dashboards/HarvestMarketingDashboard';
import { ExtensionEmploymentRiskDashboard } from './components/dashboards/ExtensionEmploymentRiskDashboard';
import { AdvancedAnalyticsDashboard } from './components/dashboards/AdvancedAnalyticsDashboard';
import { AdminKoboPanel } from './components/admin/AdminKoboPanel';
import { AdminAuthGate } from './components/admin/AdminAuthGate';
import { generateExecutivePdfReport } from './utils/pdfReportGenerator';
import oromiaLogo from './assets/logo.png';

// Icons
import {
  Wheat,
  Globe,
  Sun,
  Moon,
  Smartphone,
  Sliders,
  Printer,
  ChevronDown,
  Filter,
  FileDown,
  Loader2,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en'); // default interface language English as requested
  const [activeTab, setActiveTab] = useState<DashboardTab>('regional_exec');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<number | 'all'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Core state
  const [zones, setZones] = useState<ZoneRecord[]>(() => loadSavedZones());
  const [schemes, setSchemes] = useState<IrrigationScheme[]>(() => loadSavedSchemes());

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle plan updates from Admin panel
  const handleUpdateZones = (newZones: ZoneRecord[]) => {
    setZones(newZones);
    saveZonesToStorage(newZones);
  };

  const handleUpdateSchemes = (newSchemes: IrrigationScheme[]) => {
    setSchemes(newSchemes);
    saveSchemesToStorage(newSchemes);
  };

  // Filtered dataset if user picks a specific zone
  const displayedZones = selectedZoneFilter === 'all'
    ? zones
    : zones.filter(z => z.id === selectedZoneFilter);

  const displayedSchemes = selectedZoneFilter === 'all'
    ? schemes
    : schemes.filter(s => s.zoneId === selectedZoneFilter);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Printable summary handler
  const handlePrintReport = () => {
    window.print();
  };

  // High-fidelity executive PDF generator
  const handleDownloadPdf = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        generateExecutivePdfReport({
          zones: displayedZones,
          schemes: displayedSchemes,
          lang,
          selectedZoneId: selectedZoneFilter,
        });
      } catch (err) {
        console.error('Failed to generate PDF report:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element wordmark with official Bureau logo
        Zone 2: 4-5 clean single-line text links
        Zone 3: 1 primary action
      */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark with Official Oromia Bureau Logo */}
          <button
            onClick={() => setActiveTab('regional_exec')}
            className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 group cursor-pointer"
          >
            <img
              src={oromiaLogo}
              alt="Biiroo Qonnaa Oromiyaa - Oromia Bureau of Agriculture"
              className="h-11 w-auto max-w-[110px] object-contain shrink-0 drop-shadow-sm rounded"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                Oromia BOA Irrigated Wheat Report
              </span>
              <span className="text-[10px] text-slate-500 font-medium block leading-none mt-0.5">
                Biiroo Qonnaa Oromiyaa · 2019/2026
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setActiveTab('regional_exec')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'regional_exec' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {lang === 'om' ? 'Cuunfaa Hooggansaa' : 'Executive'}
            </button>
            <button
              onClick={() => setActiveTab('executive_kpis')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'executive_kpis' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {lang === 'om' ? 'Agarsiistota (KPIs)' : 'Top KPIs'}
            </button>
            <button
              onClick={() => setActiveTab('area_progress')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'area_progress' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {lang === 'om' ? 'Uwwisa Lafaa' : 'Area Coverage'}
            </button>
            <button
              onClick={() => setActiveTab('gis_map')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'gis_map' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {lang === 'om' ? 'Kaartaa GIS' : 'GIS Map'}
            </button>
            <button
              onClick={() => setActiveTab('advanced_analytics')}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'advanced_analytics' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {lang === 'om' ? 'Xiinxala Oomishaa' : 'Analytics'}
            </button>
          </nav>

          {/* Zone 3: Actions - Download PDF Report & Admin */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title={lang === 'om' ? 'Gabaasa PDF Guutuu Buufadhu' : 'Download Executive PDF Report'}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isGeneratingPdf
                  ? (lang === 'om' ? 'PDF Qophaa\'aa...' : 'Generating...')
                  : (lang === 'om' ? 'PDF Gabaasaa' : 'Download PDF Report')}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admin_kobo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm border ${
                activeTab === 'admin_kobo'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'om' ? 'Bulchiinsa & Kobo' : 'Admin & Kobo'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* SECONDARY WORKSPACE TOOLBAR (Below the fold) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Dashboard Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1 scrollbar-none">
            {[
              { id: 'regional_exec', label: lang === 'om' ? 'Cuunfaa Hooggansaa (17)' : 'Executive Overview (17)' },
              { id: 'mobilization', label: lang === 'om' ? '0. Sosoochii (0)' : '0. Mobilization (0)' },
              { id: 'executive_kpis', label: lang === 'om' ? 'KPIs Ijoo (1)' : 'Top 15 KPIs (1)' },
              { id: 'area_progress', label: lang === 'om' ? 'Adeemsa Facaasaa (2)' : 'Area Progress (2)' },
              { id: 'input_supply', label: lang === 'om' ? 'Galteewwan (3)' : 'Input Supply (3)' },
              { id: 'irrigation_infra', label: lang === 'om' ? 'Bu\'uuraalee Jallisii (4)' : 'Irrigation Infra (4)' },
              { id: 'gis_map', label: lang === 'om' ? 'Kaartaa GIS (5)' : 'GIS Schemes (5)' },
              { id: 'mechanization', label: lang === 'om' ? 'Mekaanayizeeshinii (6-7)' : 'Mechanization & Farmers (6-7)' },
              { id: 'cluster_farming', label: lang === 'om' ? 'Kilaastara & Abbootii (8-9)' : 'Clusters & Investors (8-9)' },
              { id: 'crop_protection', label: lang === 'om' ? 'Eegumsa & Haala (10-11)' : 'Crop Protection (10-11)' },
              { id: 'harvest_yield', label: lang === 'om' ? 'Sassaabbii & Gabaa (12-13)' : 'Harvest & Price (12-13)' },
              { id: 'employment', label: lang === 'om' ? 'Hojii & Rakkoolee (14-16)' : 'Jobs, Days & Risk (14-16)' },
              { id: 'advanced_analytics', label: lang === 'om' ? 'Tilmaama & Qabxii' : 'Analytics & Scorecard' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right utility controls: Zone Filter, Language Switcher, Theme Switcher, Print */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Zone Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedZoneFilter}
                onChange={e => setSelectedZoneFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">{lang === 'om' ? 'Godinoota Hunda (14)' : 'All 14 Zones & Cities'}</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {lang === 'om' ? z.name : z.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'om' ? 'en' : 'om')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Switch Language (Afaan Oromoo / English)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'om' ? 'Afaan Oromoo' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* PDF Report Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors cursor-pointer disabled:opacity-60"
              title={lang === 'om' ? 'Gabaasa PDF Buufadhu' : 'Download Executive PDF Report'}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>PDF</span>
            </button>

            {/* Print / Export Report */}
            <button
              onClick={handlePrintReport}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={lang === 'om' ? 'Gabaasa Maxxansi' : 'Print Executive Report'}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN VIEWPORT CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'regional_exec' && (
          <RegionalExecutiveDashboard
            zones={displayedZones}
            schemes={displayedSchemes}
            lang={lang}
            onNavigateTab={t => setActiveTab(t)}
          />
        )}

        {activeTab === 'mobilization' && (
          <MobilizationDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'executive_kpis' && (
          <ExecutiveKpis zones={displayedZones} schemes={displayedSchemes} lang={lang} />
        )}

        {activeTab === 'area_progress' && (
          <AreaCoverageDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'input_supply' && (
          <InputSupplyDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'irrigation_infra' && (
          <IrrigationInfraDashboard
            schemes={displayedSchemes}
            zones={displayedZones}
            lang={lang}
          />
        )}

        {activeTab === 'gis_map' && (
          <OromiaGisMap schemes={displayedSchemes} lang={lang} />
        )}

        {activeTab === 'mechanization' && (
          <MechanizationDemographicsDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'cluster_farming' && (
          <ClusterAndInvestorDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'crop_protection' && (
          <CropProtectionConditionDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'harvest_yield' && (
          <HarvestMarketingDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'employment' && (
          <ExtensionEmploymentRiskDashboard zones={displayedZones} lang={lang} />
        )}

        {activeTab === 'advanced_analytics' && (
          <AdvancedAnalyticsDashboard
            zones={displayedZones}
            schemes={displayedSchemes}
            lang={lang}
          />
        )}

        {activeTab === 'admin_kobo' && (
          <AdminAuthGate lang={lang}>
            <AdminKoboPanel
              zones={zones}
              schemes={schemes}
              onUpdateZones={handleUpdateZones}
              onUpdateSchemes={handleUpdateSchemes}
              lang={lang}
            />
          </AdminAuthGate>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src={oromiaLogo}
              alt="Oromia Bureau of Agriculture"
              className="h-8 w-auto object-contain shrink-0 drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Biiroo Qonnaa Oromiyaa (Oromia Bureau of Agriculture)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Oromia BOA Irrigated Wheat Report · Misooma Qamadii Jallisii Bara 2019/2026
              </span>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Total Planned: 4,030,000 ha</span>
              <span>·</span>
              <span>Expected Output: 168.3M q</span>
              <span>·</span>
              <button
                onClick={() => setActiveTab('admin_kobo')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                8/8 Kobo Forms Synced
              </button>
            </div>
            {/* User Requested Footnote */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic mt-0.5">
              In collaboration with IQQO (Addisu H. and Getachew H.)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
