import React from 'react';
import { X, Play, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './ShowreelModal.css';

export default function ShowreelModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="showreel-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent="true"
        >
          <motion.div
            className="showreel-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="showreel-header">
              <div className="showreel-badge">
                <Sparkles size={14} style={{ color: '#ea77ff' }} />
                <span>Showreel Highlight 2026</span>
              </div>
              <button className="showreel-close-btn" onClick={onClose} aria-label="Tutup Showreel">
                <X size={20} />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="showreel-video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/Es-1emocMOM?autoplay=1&rel=0"
                title="Ahmad Nafi Cinematic Showreel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="showreel-iframe"
              ></iframe>
            </div>

            {/* Footer / Caption */}
            <div className="showreel-footer">
              <div>
                <h3 className="showreel-title">Koleksi Visual Sinematik Ahmad Nafi</h3>
                <p className="showreel-subtitle">Dokumentasi Wisuda, Festival Musik Kias Fest, & Product Branding (2023 - 2026)</p>
              </div>
              <a
                href="https://wa.me/6283815906766?text=Halo%20Nafi,%20saya%20tertarik%20dengan%20video%20showreel"
                target="_blank"
                rel="noopener noreferrer"
                className="showreel-cta-btn btn"
              >
                <span>Konsultasi Proyek Video</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
