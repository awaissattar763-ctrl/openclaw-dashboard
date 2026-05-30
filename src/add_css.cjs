const fs = require('fs');
let code = fs.readFileSync('App.jsx', 'utf8');

const premiumCSS = `
/* Premium Animations Phase 3 */

/* 1. Entrance Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.stagger > *:nth-child(1) { animation-delay: 0.05s; }
.stagger > *:nth-child(2) { animation-delay: 0.10s; }
.stagger > *:nth-child(3) { animation-delay: 0.15s; }
.stagger > *:nth-child(4) { animation-delay: 0.20s; }
.stagger > *:nth-child(5) { animation-delay: 0.25s; }
.stagger > *:nth-child(6) { animation-delay: 0.30s; }

/* 2. Chat Animations */
@keyframes messageSlideInRight {
  from { opacity: 0; transform: translateX(16px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes messageSlideInLeft {
  from { opacity: 0; transform: translateX(-16px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
.message-user { animation: messageSlideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
.message-ai { animation: messageSlideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
.typing-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10B981;
  animation: typingBounce 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.30s; }

/* 3. Glowing / Pulsing */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 255, 136, 0); }
}
.status-active { animation: pulseGlow 2s infinite; }

@keyframes dotPulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #00ff88;
  display: inline-block;
  flex-shrink: 0;
  animation: dotPulse 2s infinite;
}

/* 4. Hover Microinteractions */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 255, 136, 0.3) !important;
}
.btn-press { transition: transform 0.1s ease; }
.btn-press:active { transform: scale(0.97); }

.quick-cmd {
  position: relative;
  transition: all 0.2s ease;
}
.quick-cmd:hover {
  background: rgba(0, 255, 136, 0.08) !important;
  border-color: rgba(0, 255, 136, 0.4) !important;
  padding-left: 20px;
}
.quick-cmd::after {
  content: '→';
  position: absolute;
  right: 12px;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.2s ease;
  color: #00ff88;
}
.quick-cmd:hover::after {
  opacity: 1;
  transform: translateX(0);
}

/* 6. Animated Background */
.dashboard-bg {
  background-color: #050c1a;
  background-image: 
    linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridMove 25s linear infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.ambient-glow {
  position: fixed;
  top: -200px; right: -200px;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%);
  pointer-events: none;
  animation: breathe 8s ease-in-out infinite;
  z-index: 0;
}

/* 7. Sidebar Indicator */
.nav-item {
  position: relative;
  transition: all 0.2s ease;
}
@keyframes navIndicator {
  to { height: 60%; }
}
.nav-item.active {
  background: rgba(0, 255, 136, 0.08) !important;
  color: #00ff88 !important;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 0;
  background: #00ff88;
  border-radius: 0 3px 3px 0;
  animation: navIndicator 0.3s ease forwards;
  box-shadow: 0 0 6px #00ff88;
}

/* 8. Page Transition */
@keyframes pageEnter {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}
.page-content { animation: pageEnter 0.3s ease both; }

/* 9. Toast Spring */
@keyframes toastSpringIn {
  0% { opacity: 0; transform: translateX(100%) scale(0.9); }
  60% { transform: translateX(-8px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastSlideOut {
  to { opacity: 0; transform: translateX(120%); }
}
.toast-msg { animation: toastSpringIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; position: relative; }
.toast-msg.exiting { animation: toastSlideOut 0.3s ease forwards; }

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
.toast-progress {
  height: 2px;
  background: currentColor;
  animation: toastProgress 3.8s linear forwards;
  position: absolute;
  bottom: 0; left: 0;
}

/* 10. Shimmer */
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, 
    #08142c 25%, #0c1c38 50%, #08142c 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

/* 12. Glow Borders Focus */
.input-premium {
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.input-premium:focus {
  border-color: #00ff88;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.15);
  outline: none;
}

/* Prefers Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// Inject into G
if (!code.includes('Premium Animations Phase 3')) {
  // Find the end of the global style block
  const match = code.match(/@media \(prefers-reduced-motion: reduce\).*?}\n\n/);
  if (match) {
      // Already has prefers reduced motion?
  }
  
  // Replace the closing backtick of const G
  code = code.replace(/(\.md-content a:hover \{ text-decoration: underline; \}\n)[\s]*`;/, \`$1\${premiumCSS}\`;\`);
}

fs.writeFileSync('App.jsx', code);
console.log('CSS keyframes injected successfully');
