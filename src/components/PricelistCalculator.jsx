import React, { useState } from 'react';
import { Camera, Video, Palette, Layout, Check, Sparkles, Send, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './PricelistCalculator.css';

const SERVICES_DATA = [
  {
    id: 'photography',
    name: 'Fotografi',
    icon: Camera,
    basePrice: 350000,
    packages: [
      { id: 'grad_single', label: 'Wisuda Perorangan (Solo)', price: 350000, desc: '1 Sesi foto, 15-20 edited photo, all raw file' },
      { id: 'grad_group', label: 'Wisuda Kelompok / Geng', price: 650000, desc: 'Sesi kelompok, all edited photo & softfile drive' },
      { id: 'event_photo', label: 'Liputan Event / Acara (Half-Day)', price: 850000, desc: 'Durasi hingga 4 jam, dokumentasi penuh acara' },
      { id: 'event_full', label: 'Liputan Event / Acara (Full-Day)', price: 1500000, desc: 'Durasi hingga 8 jam, liputan lengkap & highlight album' }
    ],
    addons: [
      { id: 'print_album', label: 'Cetak Album Physical & Box', price: 250000 },
      { id: 'fast_edit', label: 'Express Editing (Selesai 24 Jam)', price: 150000 },
      { id: 'all_raw', label: 'Semua Raw Files via Google Drive', price: 50000 }
    ]
  },
  {
    id: 'videography',
    name: 'Videografi & Reels',
    icon: Video,
    basePrice: 500000,
    packages: [
      { id: 'reels_short', label: 'Video Short / Reels 9:16 (1 Video)', price: 500000, desc: 'Video vertikal sinematik TikTok / Instagram Reels 30-60 detik' },
      { id: 'reels_bundle', label: 'Bundle 3 Video Reels Sinematik', price: 1200000, desc: '3 Konten video vertikal siap upload' },
      { id: 'event_video', label: 'Video Teaser Event / Acara', price: 1500000, desc: 'Video liputan sinematik 1-3 menit + teaser reels 60s' },
      { id: 'company_profile', label: 'Video Profile Brand / Company', price: 2500000, desc: 'Konsep matang, dubbing/music, & 4K cinematic grading' }
    ],
    addons: [
      { id: 'drone_shots', label: 'Pengambilan Gambar Udara (Drone Footage)', price: 450000 },
      { id: 'fast_edit_v', label: 'Express Edit (Selesai 48 Jam)', price: 250000 },
      { id: 'voice_over', label: 'Talent Voice Over / Sound Effect FX', price: 200000 }
    ]
  },
  {
    id: 'design',
    name: 'Desain Grafis',
    icon: Palette,
    basePrice: 200000,
    packages: [
      { id: 'logo_basic', label: 'Desain Logo & Visual Branding', price: 450000, desc: '2 Opsi konsep logo, file PNG/SVG/AI, & brand color' },
      { id: 'feeds_ig', label: 'Desain Layout Feed IG (9 Post)', price: 500000, desc: 'Template feed Instagram berurutan & rapi' },
      { id: 'poster_banner', label: 'Poster Event / Flyer Promosi', price: 200000, desc: 'Desain poster cetak & digital resolusi tinggi' }
    ],
    addons: [
      { id: 'source_file', label: 'Master File Original (.AI / .PSD / .FIG)', price: 100000 },
      { id: 'extra_revision', label: 'Garansi Revisi Tanpa Batas', price: 150000 }
    ]
  },
  {
    id: 'uiux',
    name: 'UI/UX Design',
    icon: Layout,
    basePrice: 800000,
    packages: [
      { id: 'landing_ui', label: 'Landing Page UI Design (Figma)', price: 800000, desc: 'Desain tampilan website landing page modern & responsif' },
      { id: 'mobile_ui', label: 'Mobile App UI (Up to 5 Screens)', price: 1200000, desc: 'Desain antarmuka aplikasi Android/iOS + interactive prototype' },
      { id: 'full_web_dev', label: 'UI Design + Front-End Web Development', price: 2500000, desc: 'Desain UI lengkap + pengkodean website React/Vite live' }
    ],
    addons: [
      { id: 'prototype_figma', label: 'Interactive Animation Prototyping', price: 250000 },
      { id: 'design_system', label: 'Full Design System & Component Library', price: 350000 }
    ]
  }
];

export default function PricelistCalculator() {
  const [selectedServiceId, setSelectedServiceId] = useState('photography');
  const selectedService = SERVICES_DATA.find(s => s.id === selectedServiceId);
  
  const [selectedPackageId, setSelectedPackageId] = useState(selectedService.packages[0].id);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const handleServiceChange = (serviceId) => {
    setSelectedServiceId(serviceId);
    const newService = SERVICES_DATA.find(s => s.id === serviceId);
    setSelectedPackageId(newService.packages[0].id);
    setSelectedAddons([]);
  };

  const handleAddonToggle = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const currentPackage = selectedService.packages.find(p => p.id === selectedPackageId) || selectedService.packages[0];
  
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = selectedService.addons.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalPrice = (currentPackage ? currentPackage.price : 0) + addonsTotal;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const generateWhatsAppLink = () => {
    const addonNames = selectedAddons
      .map(id => selectedService.addons.find(a => a.id === id)?.label)
      .filter(Boolean);

    let message = `Halo Ahmad Nafi, saya ingin berkonsultasi mengenai estimasi proyek berikut:\n\n`;
    message += `📌 *Layanan Utama*: ${selectedService.name}\n`;
    message += `📦 *Paket Dipilih*: ${currentPackage.label} (${formatRupiah(currentPackage.price)})\n`;
    if (addonNames.length > 0) {
      message += `✨ *Opsi Tambahan*:\n- ${addonNames.join('\n- ')}\n`;
    }
    message += `\n💰 *Total Estimasi Biaya*: *${formatRupiah(totalPrice)}*\n\nApakah jadwal untuk konsep ini tersedia?`;

    return `https://wa.me/6283815906766?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="calculator" className="calculator-section section-container">
      <div className="container">
        {/* Section Header */}
        <div className="section-header center-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Calculator size={14} style={{ color: 'var(--accent-color)' }} />
            <span>Kalkulator Estimasi Biaya</span>
          </div>
          <h2 className="section-title">Hitung Perkiraan Budget Proyek Kamu</h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Pilih jenis layanan visual dan opsi tambahan yang kamu butuhkan untuk melihat perkiraan transparansi biaya secara rinci.
          </p>
        </div>

        <div className="calculator-grid">
          {/* Left Column: Selections */}
          <div className="calculator-controls">
            {/* Step 1: Select Service */}
            <div className="calc-group">
              <label className="calc-group-label">1. Pilih Jenis Layanan Utama</label>
              <div className="calc-service-tabs">
                {SERVICES_DATA.map((service) => {
                  const Icon = service.icon;
                  const isActive = service.id === selectedServiceId;
                  return (
                    <button
                      key={service.id}
                      className={`calc-service-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleServiceChange(service.id)}
                    >
                      <Icon size={18} />
                      <span>{service.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Package */}
            <div className="calc-group">
              <label className="calc-group-label">2. Pilih Paket Pengerjaan</label>
              <div className="calc-packages-list">
                {selectedService.packages.map((pkg) => {
                  const isSelected = pkg.id === selectedPackageId;
                  return (
                    <div
                      key={pkg.id}
                      className={`calc-package-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPackageId(pkg.id)}
                    >
                      <div className="calc-pkg-header">
                        <div className="calc-pkg-radio">
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="calc-pkg-info">
                          <h4 className="calc-pkg-title">{pkg.label}</h4>
                          <p className="calc-pkg-desc">{pkg.desc}</p>
                        </div>
                      </div>
                      <div className="calc-pkg-price">{formatRupiah(pkg.price)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Add-ons */}
            {selectedService.addons.length > 0 && (
              <div className="calc-group">
                <label className="calc-group-label">3. Opsi Tambahan / Add-ons (Opsional)</label>
                <div className="calc-addons-grid">
                  {selectedService.addons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        className={`calc-addon-chip ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleAddonToggle(addon.id)}
                      >
                        <div className="calc-addon-checkbox">
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="calc-addon-label">{addon.label}</span>
                        <span className="calc-addon-price">+{formatRupiah(addon.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Price Summary Card */}
          <div className="calculator-summary">
            <div className="calc-summary-card">
              <div className="calc-summary-header">
                <Sparkles size={20} className="sparkle-icon" />
                <h3>Ringkasan Estimasi Biaya</h3>
              </div>

              <div className="calc-summary-body">
                <div className="summary-item">
                  <span className="summary-label">Layanan:</span>
                  <span className="summary-value font-semibold">{selectedService.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Paket:</span>
                  <span className="summary-value font-semibold">{currentPackage.label}</span>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="summary-addons-list">
                    <span className="summary-label">Opsi Tambahan ({selectedAddons.length}):</span>
                    {selectedAddons.map(id => {
                      const addon = selectedService.addons.find(a => a.id === id);
                      return (
                        <div key={id} className="summary-addon-row">
                          <span>+ {addon.label}</span>
                          <span>{formatRupiah(addon.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-total-container">
                  <span className="total-label">Total Perkiraan Biaya:</span>
                  <motion.div
                    key={totalPrice}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="total-amount"
                  >
                    {formatRupiah(totalPrice)}
                  </motion.div>
                </div>
              </div>

              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="calc-submit-wa-btn btn"
              >
                <span>Kirim Rincian Estimasi ke WA Nafi</span>
                <Send size={16} />
              </a>

              <p className="calc-disclaimer">
                * Estimasi dapat disesuaikan kembali sesuai dengan kebutuhan spesifik & ruang lingkup konsep proyek Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
