import React from 'react';
import { ArrowRight, Sparkles, Code, Atom, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero">
      <a href="#courses" className="hero-badge">
        <span className="badge-ping"></span>
        <span>EduFlow 2.0 platformasi ishga tushdi</span>
        <ArrowRight size={14} className="badge-arrow" />
      </a>

      <h1 className="hero-title">
        Kelajak kasbini <br className="hidden-mobile" />
        <span className="gradient-text">zamonaviy usulda</span> o'rganing
      </h1>

      <p className="hero-sub">
        Dasturlashni quruq nazariya bilan emas, real amaliyot va real loyihalar orqali o'rganing. Premium kurslar, ochiq kodlar va komyuniti bir joyda.
      </p>

      <div className="hero-cta">
        <button className="btn-glow">
          Kurslarni boshlash <Sparkles size={18} className="sparkle" />
        </button>
        <button className="btn-outline-hero">
          <Code size={18} /> Loyihalar
        </button>
      </div>

      <div className="hero-editor-wrap">
        <div className="float-icon float-icon-1"><Atom size={32} color="#61dafb" /></div>
        <div className="float-icon float-icon-2"><Terminal size={32} color="#8b5cf6" /></div>

        <div className="code-editor">
          <div className="editor-toolbar">
            <div className="editor-dots">
              <div className="dot-r"></div>
              <div className="dot-y"></div>
              <div className="dot-g"></div>
            </div>
            <div className="editor-title">app/page.tsx - EduFlow</div>
          </div>
          <div className="editor-body">
            <div className="code-line">
              <span className="ln">1</span>
              <span><span className="kw">import</span> <span className="fn">{'{ Developer }'}</span> <span className="kw">from</span> <span className="str">'@/future'</span></span>
            </div>
            <div className="code-line"><span className="ln">2</span></div>
            <div className="code-line">
              <span className="ln">3</span>
              <span><span className="var">EduFlowStudent</span> <span className="op">=</span> () <span className="kw">=&gt;</span> {'{'}</span>
            </div>
            <div className="code-line">
              <span className="ln">4</span>
              <span>&nbsp;&nbsp;<span className="kw">const</span> skills <span className="op">=</span> <span className="fn">useLearn</span>(<span className="str">'React.js'</span>)</span>
            </div>
            <div className="code-line">
              <span className="ln">5</span>
              <span>&nbsp;&nbsp;<span className="kw">return</span> (</span>
            </div>
            <div className="code-line">
              <span className="ln">6</span>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="tag">Developer</span></span>
            </div>
            <div className="code-line">
              <span className="ln">7</span>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">status</span>=<span className="str">"Hired"</span></span>
            </div>
            <div className="code-line">
              <span className="ln">8</span>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="attr">salary</span>=<span className="str">"Unlimited"</span></span>
            </div>
            <div className="code-line">
              <span className="ln">9</span>
              <span>&nbsp;&nbsp;&nbsp;&nbsp;/&gt;</span>
            </div>
            <div className="code-line">
              <span className="ln">10</span>
              <span>&nbsp;&nbsp;)</span>
            </div>
            <div className="code-line">
              <span className="ln">11</span>
              <span>{'}'}<span className="cursor"></span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
