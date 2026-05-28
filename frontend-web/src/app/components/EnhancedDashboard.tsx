import { useEffect, useRef } from 'react';
import HtmlBody from '../../imports/Html→Body/Html→Body';

export default function EnhancedDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="size-full overflow-y-auto scroll-smooth">
      <style>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Enhanced navigation links */
        [data-name="Link"],
        [data-name="Link:margin"] {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        [data-name="Link:margin"]:hover {
          color: #8b2121 !important;
        }

        [data-name="Link:margin"]:hover p {
          color: #8b2121 !important;
        }

        [data-name="Link:margin"]::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #8b2121;
          transition: width 0.3s ease;
        }

        [data-name="Link:margin"]:hover::after {
          width: 100%;
        }

        /* Enhanced buttons */
        button,
        [role="button"],
        [data-name*="Button"] {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        [data-name*="Button"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        [data-name*="Button"]:active {
          transform: translateY(0);
        }

        /* Enhanced cards */
        [data-name*="Card"],
        [data-name*="CardContainer"] {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        [data-name*="Card"]:hover,
        [data-name*="CardContainer"]:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Search input enhancement */
        [data-name="Input"] {
          transition: all 0.3s ease;
        }

        [data-name="Input"]:focus-within {
          box-shadow: 0 0 0 3px rgba(139, 33, 33, 0.1);
          background-color: #ffffff;
        }

        /* Image hover effects */
        img {
          transition: transform 0.3s ease;
        }

        [data-name*="Card"]:hover img,
        [data-name*="CardContainer"]:hover img {
          transform: scale(1.05);
        }

        /* Header shadow on scroll */
        [data-name="MainHeader"] {
          transition: box-shadow 0.3s ease;
        }

        .scrolled [data-name="MainHeader"] {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* Hero section gradient overlay */
        [data-name="HeroSection"] {
          position: relative;
        }

        /* Animated border for active elements */
        @keyframes borderPulse {
          0%, 100% {
            border-color: #8b2121;
          }
          50% {
            border-color: #b82e2e;
          }
        }

        [data-name="Link"] {
          animation: borderPulse 2s ease-in-out infinite;
        }

        /* Fade in animation for content */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        [data-name="MainContainer"] > * {
          animation: fadeIn 0.6s ease-out forwards;
        }

        [data-name="MainContainer"] > *:nth-child(1) {
          animation-delay: 0.1s;
        }

        [data-name="MainContainer"] > *:nth-child(2) {
          animation-delay: 0.2s;
        }

        [data-name="MainContainer"] > *:nth-child(3) {
          animation-delay: 0.3s;
        }

        [data-name="MainContainer"] > *:nth-child(4) {
          animation-delay: 0.4s;
        }

        /* Better focus states */
        *:focus-visible {
          outline: 2px solid #8b2121;
          outline-offset: 2px;
        }

        /* Link hover with underline animation */
        a, [role="link"] {
          position: relative;
          transition: color 0.3s ease;
        }

        a::before, [role="link"]::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: currentColor;
          transition: width 0.3s ease;
        }

        a:hover::before, [role="link"]:hover::before {
          width: 100%;
        }

        /* Enhanced shadows for depth */
        [data-name="MainContainer"] {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* Smooth image loading */
        img {
          opacity: 0;
          animation: imageLoad 0.5s ease-in forwards;
        }

        @keyframes imageLoad {
          to {
            opacity: 1;
          }
        }

        /* Grid layout improvements */
        [data-name*="Grid"] {
          gap: 24px;
        }

        /* Text selection styling */
        ::selection {
          background-color: #8b2121;
          color: white;
        }

        /* Loading state shimmer effect */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .loading {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            #f3f4f6 0%,
            #e5e7eb 20%,
            #f3f4f6 40%,
            #f3f4f6 100%
          );
          background-size: 1000px 100%;
        }

        /* Sticky header enhancement */
        [data-name="MainHeader"] {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
        }

        /* Card grid stagger animation */
        [data-name*="Grid"] > * {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        [data-name*="Grid"] > *:nth-child(1) { animation-delay: 0.1s; }
        [data-name*="Grid"] > *:nth-child(2) { animation-delay: 0.2s; }
        [data-name*="Grid"] > *:nth-child(3) { animation-delay: 0.3s; }
        [data-name*="Grid"] > *:nth-child(4) { animation-delay: 0.4s; }
        [data-name*="Grid"] > *:nth-child(5) { animation-delay: 0.5s; }
        [data-name*="Grid"] > *:nth-child(6) { animation-delay: 0.6s; }

        /* Better container spacing */
        [data-name="MainContainer"] {
          border-radius: 12px;
          overflow: hidden;
        }

        /* Enhanced footer */
        [data-name="Footer"] {
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
        }

        /* Highlight effect on hover */
        @keyframes highlight {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 33, 33, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(139, 33, 33, 0.1);
          }
        }

        [data-name*="Card"]:hover {
          animation: highlight 1s ease-in-out;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        ::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Improved responsive images */
        img {
          object-fit: cover;
          will-change: transform;
        }

        /* Badge pulse animation */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        [data-name*="Badge"] {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Section reveal on scroll */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        section, [data-name*="Section"] {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
      <HtmlBody />
    </div>
  );
}
