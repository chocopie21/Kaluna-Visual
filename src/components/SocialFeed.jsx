import React from 'react';
import { ExternalLink, Heart, MessageCircle, Sparkles } from 'lucide-react';
import './SocialFeed.css';

const InstagramIcon = ({ size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const INSTAGRAM_POSTS = [
  {
    id: 1,
    title: 'Graduation Session Kaluna Visual',
    image: 'uploads/1784501266761_DSC08515.webp',
    likes: '1,420',
    comments: '84',
    url: 'https://instagram.com/kalunavisual'
  },
  {
    id: 2,
    title: 'Kias Fest Music Festival Live Footage',
    image: 'uploads/1783396687986_DJI_0283.jpg',
    likes: '2,890',
    comments: '162',
    url: 'https://instagram.com/kalunavisual'
  },
  {
    id: 3,
    title: 'Perkara Telu Creative Feed Design',
    image: 'uploads/1783464229235_PERKARA.jpg',
    likes: '980',
    comments: '45',
    url: 'https://instagram.com/kalunavisual'
  },
  {
    id: 4,
    title: 'Raven Claw Graduation Moments',
    image: 'uploads/1784246984756_653997906_18096079453834017_5674396985173935682_n.webp',
    likes: '1,760',
    comments: '92',
    url: 'https://instagram.com/kalunavisual'
  }
];

export default function SocialFeed() {
  return (
    <section className="social-feed-section section-container">
      <div className="container">
        {/* Header */}
        <div className="social-feed-header">
          <div className="social-feed-title-wrapper">
            <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <InstagramIcon size={14} style={{ color: '#E1306C' }} />
              <span>Kaluna Visual Feed</span>
            </div>
            <h2 className="section-title">Ikuti Karya Terbaru di Instagram</h2>
          </div>

          <a
            href="https://instagram.com/kalunavisual"
            target="_blank"
            rel="noopener noreferrer"
            className="social-follow-btn"
          >
            <InstagramIcon size={18} />
            <span>@kalunavisual</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Grid Posts */}
        <div className="social-posts-grid">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-post-card"
            >
              <img src={post.image} alt={post.title} loading="lazy" className="social-post-img" />
              <div className="social-post-overlay">
                <div className="social-post-stats">
                  <span><Heart size={16} fill="white" /> {post.likes}</span>
                  <span><MessageCircle size={16} fill="white" /> {post.comments}</span>
                </div>
                <p className="social-post-caption">{post.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
