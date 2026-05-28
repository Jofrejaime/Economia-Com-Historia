import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import HtmlBody from '../../imports/Html→Body/Html→Body';

export default function ModernDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        if (containerRef.current.scrollTop > 50) {
          containerRef.current.classList.add('scrolled');
        } else {
          containerRef.current.classList.remove('scrolled');
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const element = target.closest('[data-nav]');
    if (element) {
      const action = element.getAttribute('data-nav');
      if (action === 'quiz') {
        navigate('/quiz');
      } else if (action === 'comunidade') {
        navigate('/comunidade');
      }
    }
  };

  return (
    <div ref={containerRef} className="size-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50" onClick={handleClick}>
      <style>{`
        /* Modern Design System */

        /* Root Layout Improvements */
        [data-name="Html → Body"] {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f3f4f6 100%) !important;
          padding: 0 !important;
          min-height: 100vh;
        }

        [data-name="MainContainer"] {
          max-width: 1280px !important;
          margin: 0 auto !important;
          padding: 0 2rem !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        /* Modern Header with Glassmorphism */
        [data-name="MainHeader"] {
          position: sticky !important;
          top: 0 !important;
          z-index: 1000 !important;
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          padding: 1.5rem 2rem !important;
          margin: 0 -2rem 3rem -2rem !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .scrolled [data-name="MainHeader"] {
          background: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          padding: 1rem 2rem !important;
        }

        /* Logo/Heading Enhancement */
        [data-name="Heading 1"] {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          background: linear-gradient(135deg, #8b2121 0%, #b82e2e 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }

        /* Modern Navigation */
        [data-name="Nav"] {
          gap: 0.5rem !important;
        }

        [data-name="Link"],
        [data-name="Link:margin"] {
          cursor: pointer;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          font-weight: 500 !important;
          position: relative;
        }

        [data-name="Link"]::after,
        [data-name="Link:margin"]::after {
          content: none !important;
        }

        [data-name="Link"] {
          background: linear-gradient(135deg, #8b2121 0%, #b82e2e 100%) !important;
          color: white !important;
          box-shadow: 0 2px 8px rgba(139, 33, 33, 0.2) !important;
        }

        [data-name="Link"] * {
          color: white !important;
        }

        [data-name="Link"]:hover {
          box-shadow: 0 4px 12px rgba(139, 33, 33, 0.3) !important;
          transform: translateY(-1px) !important;
        }

        [data-name="Link:margin"]:hover {
          background: rgba(139, 33, 33, 0.08) !important;
          color: #8b2121 !important;
        }

        [data-name="Link:margin"]:hover * {
          color: #8b2121 !important;
        }

        /* Enhanced Search Input */
        [data-name="Input"] {
          background: white !important;
          border: 1.5px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          padding: 0.75rem 1rem 0.75rem 2.5rem !important;
          width: 280px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }

        [data-name="Input"]:hover {
          border-color: #d1d5db !important;
        }

        [data-name="Input"]:focus-within {
          border-color: #8b2121 !important;
          box-shadow: 0 0 0 4px rgba(139, 33, 33, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          background: white !important;
        }

        /* Hero Section Modern Design */
        [data-name="HeroSection"] {
          background: linear-gradient(135deg, #8b2121 0%, #6d1919 100%) !important;
          border-radius: 1.5rem !important;
          padding: 4rem 3rem !important;
          margin: 0 0 4rem 0 !important;
          position: relative !important;
          overflow: hidden !important;
          box-shadow: 0 20px 60px rgba(139, 33, 33, 0.2) !important;
        }

        [data-name="HeroSection"]::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background:
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%) !important;
          pointer-events: none !important;
        }

        [data-name="HeroSection"] * {
          position: relative !important;
          z-index: 1 !important;
        }

        [data-name="HeroSection"] img {
          border-radius: 1rem !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        [data-name="HeroSection"]:hover img {
          transform: scale(1.02) !important;
        }

        /* Modern Card Design */
        [data-name*="Card"],
        [data-name*="CardContainer"] {
          background: white !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          padding: 2rem !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          overflow: hidden !important;
        }

        [data-name*="Card"]:hover,
        [data-name*="CardContainer"]:hover {
          transform: translateY(-8px) !important;
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04) !important;
          border-color: rgba(139, 33, 33, 0.1) !important;
        }

        [data-name*="Card"] img,
        [data-name*="CardContainer"] img {
          border-radius: 0.75rem !important;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        [data-name*="Card"]:hover img,
        [data-name*="CardContainer"]:hover img {
          transform: scale(1.05) !important;
        }

        /* Button Improvements */
        button,
        [data-name*="Button"] {
          cursor: pointer !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          padding: 0.875rem 1.75rem !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        [data-name*="Button"]:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
        }

        [data-name*="Button"]:active {
          transform: translateY(0) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        /* Grid Layout Enhancement */
        [data-name*="Grid"] {
          display: grid !important;
          gap: 2rem !important;
          margin: 3rem 0 !important;
        }

        /* Content Sections Spacing */
        [data-name="MainContentGrid"] {
          padding: 2rem 0 !important;
        }

        /* Typography Improvements */
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          line-height: 1.3 !important;
          color: #1f2937 !important;
        }

        p {
          line-height: 1.6 !important;
          color: #4b5563 !important;
        }

        /* Footer Modern Design */
        [data-name="Footer"] {
          background: linear-gradient(to top, #f9fafb 0%, #ffffff 100%) !important;
          border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
          padding: 3rem 2rem !important;
          margin: 4rem -2rem 0 -2rem !important;
        }

        /* Smooth Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        [data-name="MainContainer"] > * {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        [data-name="MainContainer"] > *:nth-child(1) { animation-delay: 0.05s; }
        [data-name="MainContainer"] > *:nth-child(2) { animation-delay: 0.1s; }
        [data-name="MainContainer"] > *:nth-child(3) { animation-delay: 0.15s; }
        [data-name="MainContainer"] > *:nth-child(4) { animation-delay: 0.2s; }

        /* Grid Items Stagger */
        [data-name*="Grid"] > * {
          animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        [data-name*="Grid"] > *:nth-child(1) { animation-delay: 0.1s; }
        [data-name*="Grid"] > *:nth-child(2) { animation-delay: 0.15s; }
        [data-name*="Grid"] > *:nth-child(3) { animation-delay: 0.2s; }
        [data-name*="Grid"] > *:nth-child(4) { animation-delay: 0.25s; }
        [data-name*="Grid"] > *:nth-child(5) { animation-delay: 0.3s; }
        [data-name*="Grid"] > *:nth-child(6) { animation-delay: 0.35s; }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b2121 0%, #b82e2e 100%);
          border-radius: 10px;
          border: 2px solid #f3f4f6;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #6d1919 0%, #8b2121 100%);
        }

        /* Selection Styling */
        ::selection {
          background: rgba(139, 33, 33, 0.2);
          color: #8b2121;
        }

        /* Focus States */
        *:focus-visible {
          outline: 2px solid #8b2121;
          outline-offset: 3px;
          border-radius: 0.375rem;
        }

        /* Responsive Images */
        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* Loading State */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Hover Effects */
        a:not([data-name]) {
          color: #8b2121;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        a:not([data-name]):hover {
          color: #6d1919;
          text-decoration: underline;
        }

        /* Spacing Utilities */
        [data-name*="Section"] {
          margin: 3rem 0;
        }

        /* Container Improvements */
        [data-name*="Container"] {
          position: relative;
        }

        /* Badge/Tag Styling */
        [data-name*="Badge"],
        [data-name*="Tag"] {
          background: linear-gradient(135deg, #8b2121 0%, #b82e2e 100%);
          color: white;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(139, 33, 33, 0.2);
        }

        /* Icon Improvements */
        svg {
          transition: all 0.2s ease;
        }

        [data-name*="Button"]:hover svg,
        [data-name*="Card"]:hover svg {
          transform: scale(1.1);
        }

        /* Divider Lines */
        hr, [data-name*="Divider"] {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
          margin: 2rem 0;
        }

        /* Shadow Layers */
        .shadow-soft {
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.04),
            0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .shadow-medium {
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.06),
            0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .shadow-strong {
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04);
        }

        /* Smooth Scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Performance Optimizations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        img {
          will-change: transform;
        }

        [data-name*="Card"],
        [data-name*="Button"] {
          will-change: transform, box-shadow;
        }
      `}</style>
      <HtmlBody />
    </div>
  );
}
