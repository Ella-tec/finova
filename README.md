<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Eliyas Eshtea — Business Analyst, Software Engineer, CPA Candidate. Building FINOVA and reliable solutions at the intersection of finance and technology." />
  <title>Eliyas Eshtea | Business Analyst · Software Engineer · CPA Candidate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
:root {
  --bg: #0A0A0A;
  --bg-elevated: #141414;
  --bg-soft: #1A1A1A;
  --text: #F5F5F5;
  --text-muted: #A0A0A0;
  --silver: #C0C0C0;
  --silver-bright: #E8E8E8;
  --silver-dark: #8A8A8A;
  --white: #FFFFFF;
  --border: #2A2A2A;
  --shadow: rgba(0,0,0,0.5);
  --accent: #C0C0C0;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }
.container { width: min(1100px, 92%); margin-inline: auto; }
h1, h2, h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 600;
  line-height: 1.2;
  color: var(--white);
}
h1 { font-size: clamp(2.6rem, 5.5vw, 3.8rem); letter-spacing: -0.02em; }
h2 { font-size: clamp(1.9rem, 3.5vw, 2.6rem); }
h3 { font-size: 1.3rem; }
.lead { font-size: 1.1rem; color: var(--text-muted); max-width: 58ch; }
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(10,10,10,0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  display: flex; align-items: center; justify-content: space-between; height: 70px;
}
.logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.45rem; font-weight: 600; color: var(--white);
}
.logo span { color: var(--silver); }
.nav { display: flex; gap: 1.8rem; }
.nav a {
  font-size: 0.88rem; font-weight: 500; color: var(--text-muted);
  transition: color 0.2s; position: relative;
}
.nav a:hover, .nav a.active { color: var(--white); }
.nav a::after {
  content: ''; position: absolute; left: 0; bottom: -4px;
  width: 0; height: 1px; background: var(--silver); transition: width 0.25s;
}
.nav a:hover::after { width: 100%; }
.menu-toggle {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 4px;
}
.menu-toggle span {
  display: block; width: 22px; height: 2px; background: var(--silver);
}
.hero {
  min-height: 100vh; display: flex; align-items: center;
  padding: 110px 0 80px; position: relative; overflow: hidden;
}
.hero-content {
  display: grid; grid-template-columns: 1.25fr 0.75fr;
  gap: 3.5rem; align-items: center;
}
.eyebrow {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--silver); margin-bottom: 1rem;
}
.subtitle {
  font-size: 1.2rem; font-weight: 500; color: var(--silver-bright);
  margin: 0.7rem 0 1.2rem;
}
.tagline {
  font-size: 1.05rem; color: var(--text-muted); max-width: 42ch; margin-bottom: 1.8rem;
}
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.8rem; }
.hero-links { display: flex; gap: 1.4rem; font-size: 0.88rem; font-weight: 500; }
.hero-links a { color: var(--text-muted); transition: color 0.2s; }
.hero-links a:hover { color: var(--silver); }
.hero-visual { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.portrait-frame { position: relative; width: 270px; height: 270px; }
.portrait-ring {
  position: absolute; inset: -7px;
  border: 1.5px solid var(--silver); border-radius: 50%; opacity: 0.7;
  pointer-events: none;
}
.portrait-img {
  width: 100%; height: 100%; object-fit: cover; object-position: center top;
  border-radius: 50%; border: 3px solid #222;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}
.qr-block {
  display: flex; flex-direction: column; align-items: center; gap: 0.45rem;
  padding: 0.8rem 1rem; background: var(--bg-elevated);
  border: 1px solid var(--border); border-radius: 12px;
}
.qr-img { width: 88px; height: 88px; border-radius: 4px; background: #fff; padding: 4px; }
.qr-label {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--silver);
}
.hero-accent {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--silver), transparent);
}
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.85rem 1.7rem; font-size: 0.88rem; font-weight: 600;
  border-radius: 6px; transition: all 0.25s; cursor: pointer; border: 1.5px solid transparent;
}
.btn-primary { background: var(--white); color: #0A0A0A; }
.btn-primary:hover {
  background: var(--silver-bright); transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255,255,255,0.12);
}
.btn-outline {
  background: transparent; border-color: var(--silver); color: var(--silver);
}
.btn-outline:hover { background: var(--silver); color: #0A0A0A; }
.btn-large { padding: 1.05rem 2.1rem; font-size: 0.95rem; }
.section { padding: 90px 0; }
.section-header { margin-bottom: 3rem; text-align: center; }
.section-label {
  display: inline-block; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--silver); margin-bottom: 0.7rem;
}
.about { background: var(--bg-soft); }
.about-grid {
  display: grid; grid-template-columns: 1.35fr 1fr; gap: 3rem; align-items: start;
}
.about-content p { margin-bottom: 1.15rem; color: var(--text-muted); }
.about-content .lead { color: var(--text); font-weight: 500; }
.goal-box {
  background: var(--bg-elevated); border-left: 3px solid var(--silver);
  padding: 1.4rem 1.6rem; border-radius: 0 10px 10px 0;
  margin: 1.8rem 0; font-size: 1.02rem; color: var(--text); line-height: 1.7;
}
blockquote {
  margin-top: 1.8rem; padding: 1.4rem 1.6rem;
  border-left: 3px solid var(--silver); background: var(--bg-elevated);
  font-family: 'Cormorant Garamond', serif; font-size: 1.2rem;
  font-style: italic; color: var(--silver-bright); border-radius: 0 8px 8px 0;
}
.about-highlights { display: flex; flex-direction: column; gap: 1.3rem; }
.highlight-card {
  background: var(--bg-elevated); padding: 1.6rem; border-radius: 10px;
  border: 1px solid var(--border);
}
.highlight-card h3 { font-size: 1.05rem; margin-bottom: 0.9rem; color: var(--silver-bright); }
.highlight-card ul li {
  position: relative; padding-left: 1rem; margin-bottom: 0.45rem;
  font-size: 0.92rem; color: var(--text-muted);
}
.highlight-card ul li::before { content: '–'; position: absolute; left: 0; color: var(--silver); }
.value-props {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.3rem; margin-top: 2.5rem;
}
.value-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.6rem; text-align: center;
}
.value-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--silver-bright); }
.value-card p { font-size: 0.9rem; color: var(--text-muted); }
.open-to {
  background: linear-gradient(135deg, #1A1A1A, #111);
  border: 1px solid var(--border); border-radius: 14px;
  padding: 1.9rem 2.1rem; margin-top: 2.5rem;
  display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap;
}
.open-to h3 { color: var(--white); font-size: 1.35rem; margin-bottom: 0.35rem; }
.open-to p { opacity: 0.85; max-width: 48ch; color: var(--text-muted); }
.open-to .btn { background: var(--white); color: #0A0A0A; }
.skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.skill-group {
  background: var(--bg-elevated); padding: 1.8rem; border-radius: 12px;
  border: 1px solid var(--border);
}
.skill-group h3 { font-size: 1.1rem; margin-bottom: 1.1rem; color: var(--silver-bright); }
.skill-tags { display: flex; flex-wrap: wrap; gap: 0.55rem; }
.skill-tags span {
  display: inline-block; padding: 0.38rem 0.85rem; font-size: 0.8rem; font-weight: 500;
  background: var(--bg-soft); color: var(--text); border-radius: 100px;
  border: 1px solid var(--border); transition: border-color 0.2s;
}
.skill-tags span:hover { border-color: var(--silver); }
.project-card {
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: 14px; padding: 1.9rem; position: relative;
  transition: transform 0.25s, box-shadow 0.25s;
}
.project-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px var(--shadow); }
.project-card.featured {
  padding: 2.3rem; margin-bottom: 2.2rem;
  border-color: var(--silver-dark);
  background: linear-gradient(145deg, #161616 0%, #111 100%);
}
.project-badge {
  position: absolute; top: 1.15rem; right: 1.15rem;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; background: var(--silver); color: #0A0A0A;
  padding: 0.28rem 0.7rem; border-radius: 100px;
}
.finova-header {
  display: flex; align-items: center; gap: 1.1rem; margin-bottom: 1rem;
}
.finova-logo {
  width: 56px; height: 56px; border-radius: 12px;
  background: #0A0A0A; padding: 6px; border: 1px solid var(--border);
}
.project-tagline {
  font-size: 1.02rem; font-weight: 500; color: var(--silver-bright); margin: 0.4rem 0 1rem;
}
.project-features {
  margin: 1.1rem 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem 1.4rem;
}
.project-features li {
  font-size: 0.88rem; color: var(--text-muted); position: relative; padding-left: 0.95rem;
}
.project-features li::before { content: '•'; position: absolute; left: 0; color: var(--silver); }
.project-stack { display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 1.1rem 0; }
.project-stack span {
  font-size: 0.72rem; font-weight: 600; padding: 0.28rem 0.65rem;
  background: #222; color: var(--silver-bright); border-radius: 4px; border: 1px solid #333;
}
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.project-link {
  display: inline-block; margin-top: 0.9rem; font-size: 0.88rem; font-weight: 600; color: var(--silver);
}
.project-link:hover { color: var(--white); }
.timeline { position: relative; max-width: 760px; margin: 0 auto; }
.timeline::before {
  content: ''; position: absolute; left: 10px; top: 8px; bottom: 8px;
  width: 1.5px; background: linear-gradient(to bottom, var(--silver), #333);
}
.timeline-item { position: relative; padding-left: 44px; margin-bottom: 2.5rem; }
.timeline-marker {
  position: absolute; left: 4px; top: 6px; width: 14px; height: 14px;
  border-radius: 50%; background: var(--bg); border: 2px solid var(--silver); z-index: 1;
}
.timeline-date {
  display: block; font-size: 0.78rem; font-weight: 600; color: var(--silver);
  letter-spacing: 0.04em; margin-bottom: 0.3rem;
}
.timeline-org { font-size: 0.92rem; font-weight: 500; color: var(--silver-bright); margin: 0.2rem 0 0.5rem; }
.timeline-content p:last-child { color: var(--text-muted); font-size: 0.92rem; }
.education { background: var(--bg-soft); }
.edu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.3rem; margin-bottom: 2.2rem; }
.edu-card {
  background: var(--bg-elevated); padding: 1.6rem; border-radius: 10px; border: 1px solid var(--border);
}
.edu-card h3 { font-size: 1.1rem; margin-bottom: 0.35rem; }
.edu-card p { color: var(--text-muted); font-size: 0.92rem; }
.edu-meta { margin-top: 0.45rem !important; font-size: 0.82rem !important; color: var(--silver) !important; font-weight: 500; }
.certs-grid { display: flex; flex-wrap: wrap; gap: 0.65rem; justify-content: center; }
.certs-grid span {
  font-size: 0.8rem; padding: 0.42rem 0.95rem; background: var(--bg-elevated);
  border: 1px solid var(--border); border-radius: 100px; color: var(--text-muted);
}
.contact-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.8rem; align-items: start; }
.contact-list { margin-top: 1.8rem; }
.contact-list li { margin-bottom: 1.15rem; }
.contact-list strong {
  display: block; font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--silver); margin-bottom: 0.2rem;
}
.contact-list a { color: var(--white); font-weight: 500; transition: color 0.2s; }
.contact-list a:hover { color: var(--silver); }
.contact-cta {
  background: var(--bg-elevated); border: 1px solid var(--border);
  color: var(--text); padding: 2.3rem; border-radius: 14px; text-align: center;
}
.contact-cta p { margin-bottom: 1.6rem; color: var(--text-muted); }
.contact-cta .btn-primary { background: var(--white); color: #0A0A0A; }
.contact-cta .btn-primary:hover { background: var(--silver-bright); }
.site-footer {
  background: #050505; color: var(--text-muted); padding: 1.8rem 0;
  border-top: 1px solid var(--border);
}
.footer-inner {
  display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem;
}
.footer-links { display: flex; gap: 1.4rem; }
.footer-links a { opacity: 0.75; transition: opacity 0.2s, color 0.2s; }
.footer-links a:hover { opacity: 1; color: var(--silver); }
.weather-widget {
  position: fixed; top: 88px; right: 22px; z-index: 90;
  min-width: 140px; padding: 0.95rem 1.1rem;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: 12px; box-shadow: 0 12px 32px var(--shadow);
  transition: opacity 0.3s, transform 0.3s;
}
.weather-widget.collapsed { opacity: 0; transform: translateY(-10px) scale(0.95); pointer-events: none; }
.widget-time { font-size: 1.45rem; font-weight: 600; color: var(--white); letter-spacing: -0.02em; }
.widget-date { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.55rem; font-weight: 500; }
.widget-weather { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
.weather-icon { font-size: 1.05rem; }
.weather-temp { font-size: 1rem; font-weight: 600; color: var(--silver-bright); }
.weather-desc { font-size: 0.72rem; color: var(--text-muted); width: 100%; margin-top: 0.1rem; }
.widget-toggle {
  position: absolute; top: 5px; right: 7px; width: 20px; height: 20px;
  border: none; background: transparent; color: var(--text-muted);
  font-size: 0.95rem; cursor: pointer; border-radius: 50%;
}
.widget-toggle:hover { color: var(--white); }
.weather-reopen {
  position: fixed; top: 88px; right: 22px; z-index: 89;
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid var(--border); background: var(--bg-elevated);
  box-shadow: 0 8px 20px var(--shadow); cursor: pointer;
  display: none; align-items: center; justify-content: center;
  font-size: 1.05rem; color: var(--silver);
}
.weather-reopen.visible { display: flex; }
.weather-reopen:hover { transform: scale(1.07); }
@media (max-width: 900px) {
  .hero-content, .about-grid, .contact-grid { grid-template-columns: 1fr; }
  .hero-visual { order: -1; }
  .portrait-frame { width: 210px; height: 210px; }
  .skills-grid, .projects-grid, .edu-grid, .value-props { grid-template-columns: 1fr; }
  .project-features { grid-template-columns: 1fr; }
  .nav {
    display: none; position: absolute; top: 70px; left: 0; right: 0;
    background: var(--bg-elevated); flex-direction: column; padding: 1.3rem;
    gap: 0.9rem; border-bottom: 1px solid var(--border);
  }
  .nav.open { display: flex; }
  .menu-toggle { display: flex; }
  .weather-widget, .weather-reopen { top: auto; bottom: 18px; right: 14px; }
  .open-to { flex-direction: column; text-align: center; }
}
@media (max-width: 600px) {
  .section { padding: 65px 0; }
  .hero { padding: 95px 0 55px; }
  .hero-actions { flex-direction: column; }
  .btn { width: 100%; }
}
  </style>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="#home" class="logo">Eliyas<span>Eshtea</span></a>
      <nav class="nav" id="mainNav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </nav>
      <button class="menu-toggle" id="menuToggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <section id="home" class="hero">
    <div class="container hero-content">
      <div class="hero-text">
        <p class="eyebrow">Kansas City · Business · Technology · Innovation</p>
        <h1>Eliyas Eshtea</h1>
        <p class="subtitle">Business Analyst · Software Engineer · CPA Candidate</p>
        <p class="tagline">Building reliable digital experiences at the intersection of accounting, audit, and emerging technology.</p>
        <div class="hero-actions">
          <a href="#projects" class="btn btn-primary">View Projects</a>
          <a href="#contact" class="btn btn-outline">Get in Touch</a>
        </div>
        <div class="hero-links">
          <a href="https://github.com/Ella-tec" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.linkedin.com/in/eliyas-eshtea-249728268" target="_blank" rel="noopener">LinkedIn</a>
          <a href="mailto:tecaddis@gmail.com">Email</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="portrait-frame">
          <div class="portrait-ring"></div>
          <img src="assets/eliyas-portrait.png" alt="Eliyas Eshtea" class="portrait-img" />
        </div>
        <div class="qr-block">
          <img src="assets/qr-linkedin.png" alt="QR code to LinkedIn" class="qr-img" />
          <span class="qr-label">Scan for LinkedIn</span>
        </div>
      </div>
    </div>
    <div class="hero-accent"></div>
  </section>

  <div class="weather-widget" id="weatherWidget" role="region" aria-label="Kansas City time and weather">
    <div class="widget-time" id="liveTime" aria-live="polite">--:--</div>
    <div class="widget-date" id="liveDate" aria-live="polite"></div>
    <div class="widget-weather">
      <span class="weather-icon" id="weatherIcon" aria-hidden="true">⛅</span>
      <span class="weather-temp" id="weatherTemp">--°F</span>
      <span class="weather-desc" id="weatherDesc">Loading…</span>
    </div>
    <button class="widget-toggle" id="widgetToggle" aria-label="Hide time and weather">×</button>
  </div>

  <section id="about" class="section about">
    <div class="container">
      <div class="section-header">
        <span class="section-label">About</span>
        <h2>Career Journey</h2>
      </div>
      <div class="about-grid">
        <div class="about-content">
          <p class="lead">Kansas City professional with a background in accounting, auditing, and technology. Currently Software Engineer Intern and Solution Analyst on the ISACA AI project at i.c.stars, while volunteering for the FIFA World Cup 2026.</p>
          <div class="goal-box">
            My goal is to become a successful <strong>Business Analyst and CPA</strong> while continuing to develop skills in data engineering, software development, and emerging technologies. I combine financial expertise, engineering, and technology to build reliable solutions.
          </div>
          <p>Previously used GitHub <strong>@malu17</strong>. After losing access to that account, I now develop under <strong>@Ella-tec</strong>. Both profiles together show the full journey from low-level programming to AI-assisted enterprise platforms.</p>
          <blockquote>“Innovation is the intersection of expertise, curiosity, and purposeful action.”</blockquote>
        </div>
        <div class="about-highlights">
          <div class="highlight-card">
            <h3>Focus Areas</h3>
            <ul>
              <li>Business Analysis & CPA Path</li>
              <li>Data Engineering & Analytics</li>
              <li>Software Development</li>
              <li>CCTV & Smart Surveillance</li>
              <li>Configuration & Systems</li>
            </ul>
          </div>
          <div class="highlight-card">
            <h3>Current</h3>
            <ul>
              <li>Software Engineer Intern — i.c.stars</li>
              <li>Solution Analyst — ISACA AI</li>
              <li>Building FINOVA</li>
              <li>FIFA World Cup 2026 Volunteer</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="value-props">
        <div class="value-card">
          <h3>Hybrid Expertise</h3>
          <p>Accounting, audit, and financial process knowledge combined with modern software engineering.</p>
        </div>
        <div class="value-card">
          <h3>Practical Builder</h3>
          <p>From fiber optics and CCTV systems to full-stack applications and AI-assisted platforms.</p>
        </div>
        <div class="value-card">
          <h3>Business Mindset</h3>
          <p>Focused on reliable solutions, clear communication, Agile delivery, and real-world impact.</p>
        </div>
      </div>
      <div class="open-to">
        <div>
          <h3>Open to Opportunities</h3>
          <p>Business Analyst · Software Engineer · Solutions · Audit Technology · Data & Analytics · CPA track roles in Kansas City and remote.</p>
        </div>
        <a href="#contact" class="btn">Let’s Connect</a>
      </div>
    </div>
  </section>

  <section id="skills" class="section skills">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Expertise</span>
        <h2>Skills & Tools</h2>
      </div>
      <div class="skills-grid">
        <div class="skill-group">
          <h3>Languages & Frameworks</h3>
          <div class="skill-tags">
            <span>Python</span><span>JavaScript</span><span>TypeScript</span><span>SQL</span><span>C</span>
            <span>HTML / CSS</span><span>Node.js</span><span>React</span><span>Next.js</span><span>Flask</span><span>Django</span>
          </div>
        </div>
        <div class="skill-group">
          <h3>Data & Backend</h3>
          <div class="skill-tags">
            <span>PostgreSQL</span><span>Prisma</span><span>REST APIs</span><span>JSON</span>
            <span>Git & GitHub</span><span>Docker</span><span>Linux</span><span>Bash</span>
          </div>
        </div>
        <div class="skill-group">
          <h3>Business & Process</h3>
          <div class="skill-tags">
            <span>Business Analysis</span><span>Agile</span><span>Audit & Compliance</span>
            <span>Financial Reporting</span><span>QuickBooks</span><span>Documentation</span>
          </div>
        </div>
        <div class="skill-group">
          <h3>Infrastructure & Systems</h3>
          <div class="skill-tags">
            <span>Fiber Optics</span><span>Networking</span><span>CCTV & Access Control</span>
            <span>Technical Support</span><span>Cybersecurity</span><span>Data Center Ops</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="projects" class="section projects">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Portfolio</span>
        <h2>Featured Projects</h2>
      </div>
      <article class="project-card featured">
        <div class="project-badge">Flagship</div>
        <div class="finova-header">
          <img src="assets/finova-logo.png" alt="FINOVA Logo" class="finova-logo" />
          <div>
            <h3>FINOVA</h3>
            <p class="project-tagline" style="margin:0">AI-Powered Accounting, ERP, Audit & Analytics Platform</p>
          </div>
        </div>
        <p>AI-powered accounting, ERP, audit management, and client collaboration platform with AI Copilot assistance. Built with Next.js, TypeScript, and Prisma.</p>
        <ul class="project-features">
          <li>Accounting & ERP workflows</li>
          <li>Audit / PBC & month-end close</li>
          <li>AI Assistant & client portal</li>
          <li>Bank reconciliation & reporting</li>
        </ul>
        <div class="project-stack">
          <span>Next.js</span><span>TypeScript</span><span>Tailwind</span><span>Prisma</span><span>SQLite</span><span>NextAuth</span>
        </div>
        <div class="project-links" style="margin-top:1.3rem">
          <a href="https://github.com/Ella-tec/finova" target="_blank" rel="noopener" class="btn btn-primary">View Repository</a>
        </div>
      </article>
      <div class="projects-grid">
        <article class="project-card">
          <h3>ISA Chat / ISACA AI</h3>
          <p>AI-assisted chat experience focused on knowledge access, analytics, and application development. Part of ISACA work as Solution Analyst & Software Engineering Intern.</p>
          <div class="project-stack"><span>AI</span><span>Full-Stack</span><span>Agile</span></div>
          <a href="https://github.com/Ella-tec" target="_blank" rel="noopener" class="project-link">Explore on GitHub →</a>
        </article>
        <article class="project-card">
          <h3>aba-mela</h3>
          <p>TypeScript project under current development activity. Part of the growing portfolio of practical applications.</p>
          <div class="project-stack"><span>TypeScript</span></div>
          <a href="https://github.com/Ella-tec/aba-mela" target="_blank" rel="noopener" class="project-link">View Repository →</a>
        </article>
        <article class="project-card">
          <h3>ALX & Foundations</h3>
          <p>Earlier work under @malu17: low-level programming (C), system engineering, AirBnB clones, simple shell, and full-stack foundations.</p>
          <div class="project-stack"><span>C</span><span>Python</span><span>JavaScript</span><span>Bash</span></div>
          <a href="https://github.com/malu17" target="_blank" rel="noopener" class="project-link">Previous Profile →</a>
        </article>
      </div>
    </div>
  </section>

  <section id="experience" class="section experience">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Path</span>
        <h2>Professional Experience</h2>
      </div>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Aug 2026 – Present</span>
            <h3>Software Engineer Intern & Solution Analyst</h3>
            <p class="timeline-org">i.c.stars · Kansas City, MO</p>
            <p>ISACA AI Project. Agile collaboration, business analysis, requirements gathering, solution design, and GitHub workflows. Support AI knowledge management.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Dec 2025 – Present</span>
            <h3>FIFA World Cup 2026™ Volunteer</h3>
            <p class="timeline-org">SLV & Fan Operations · Kansas City, MO</p>
            <p>Recruit and interview volunteers; support accreditation, distribution, event preparation, stadium operations, and fan services.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Aug 2025 – Present</span>
            <h3>Internal Field Auditor</h3>
            <p class="timeline-org">Q-Pharma, Inc. · Kansas City, MO</p>
            <p>Pharmaceutical field audits for regulatory compliance. Analyze records, investigate discrepancies, prepare audit reports with corrective actions.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Aug 2025 – Mar 2026</span>
            <h3>Main Banker / Cage Auditor</h3>
            <p class="timeline-org">Ameristar Casino Hotel · Kansas City, MO</p>
            <p>Daily gaming revenue audits, reconciliations, and cash/chip verification. Ensured regulatory compliance and internal controls.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Jul 2024 – Jul 2025</span>
            <h3>Junior Staff Auditor / Accountant</h3>
            <p class="timeline-org">CMA CPA Group LLC · Kansas City, MO</p>
            <p>Financial audits and compliance reviews. Reconciliations, controls testing, journal entries, invoicing, and QuickBooks transactions.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Sep 2023 – Jun 2024</span>
            <h3>Fiber Optic Installation Technician</h3>
            <p class="timeline-org">Ervin Cable Construction · Kansas City, MO</p>
            <p>Installed, tested, spliced, and terminated fiber optic cabling. Configured routers and access points. Diagnosed network issues.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-date">Jan 2017 – Jun 2022</span>
            <h3>Lead Satellite & Security Systems Technician</h3>
            <p class="timeline-org">HD Satellite and Security · Addis Ababa, Ethiopia</p>
            <p>Installed, serviced, and troubleshot CCTV, access control, fire alarm, and satellite systems while delivering reliable client support.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section education">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Foundation</span>
        <h2>Education & Certifications</h2>
      </div>
      <div class="edu-grid">
        <div class="edu-card">
          <h3>Per Scholas</h3>
          <p>IT Support & Data Center Technician (In Progress)</p>
          <p class="edu-meta">Apr 2026 – Present</p>
        </div>
        <div class="edu-card">
          <h3>Goodwill Artemis Institute</h3>
          <p>Mini-Bridge to Technology Program</p>
          <p class="edu-meta">Python · SQL · Web · Robotics · Cybersecurity</p>
        </div>
        <div class="edu-card">
          <h3>ALX (Holberton)</h3>
          <p>Software Engineering Program</p>
          <p class="edu-meta">Python · Linux · Git · APIs · Full-Stack</p>
        </div>
        <div class="edu-card">
          <h3>National College, Addis Ababa</h3>
          <p>B.A. in Accounting & Finance</p>
          <p class="edu-meta">2018 – 2022 · GPA 3.1</p>
        </div>
      </div>
      <div class="certs-grid">
        <span>MedCerts Computer Support Specialist</span>
        <span>Project Management</span>
        <span>OSHA 10</span>
        <span>Google AI Essentials</span>
        <span>Cisco Networking Academy</span>
        <span>IT Support Specialist</span>
      </div>
    </div>
  </section>

  <section id="contact" class="section contact">
    <div class="container">
      <div class="section-header">
        <span class="section-label">Connect</span>
        <h2>Let’s Work Together</h2>
      </div>
      <div class="contact-grid">
        <div class="contact-info">
          <p class="lead">Open to opportunities in business analysis, software engineering, audit technology, data, and innovative product work. Based in Kansas City, MO.</p>
          <ul class="contact-list">
            <li><strong>Email</strong><a href="mailto:tecaddis@gmail.com">tecaddis@gmail.com</a></li>
            <li><strong>LinkedIn</strong><a href="https://www.linkedin.com/in/eliyas-eshtea-249728268" target="_blank" rel="noopener">eliyas-eshtea-249728268</a></li>
            <li><strong>GitHub (Current)</strong><a href="https://github.com/Ella-tec" target="_blank" rel="noopener">@Ella-tec</a></li>
            <li><strong>GitHub (Previous)</strong><a href="https://github.com/malu17" target="_blank" rel="noopener">@malu17</a></li>
            <li><strong>Location</strong><span>Kansas City, MO</span></li>
          </ul>
        </div>
        <div class="contact-cta">
          <p>Ready to discuss how financial expertise and engineering can solve real problems together.</p>
          <a href="mailto:tecaddis@gmail.com" class="btn btn-primary btn-large">Send a Message</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© <span id="year"></span> Eliyas Eshtea. Built with intention.</p>
      <div class="footer-links">
        <a href="https://github.com/Ella-tec" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/in/eliyas-eshtea-249728268" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
  </footer>

  <script>
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  menuToggle?.addEventListener('click', () => nav?.classList.toggle('open'));
  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  const timeEl = document.getElementById('liveTime');
  const dateEl = document.getElementById('liveDate');
  function updateClock() {
    try {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }).format(now);
      const dateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
      }).format(now);
      if (timeEl) timeEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
    } catch (e) {
      const now = new Date();
      if (timeEl) timeEl.textContent = now.toLocaleTimeString();
      if (dateEl) dateEl.textContent = now.toLocaleDateString();
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  const weatherIcon = document.getElementById('weatherIcon');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherDesc = document.getElementById('weatherDesc');
  function weatherFromCode(code) {
    const map = {
      0: { icon: '☀️', desc: 'Clear sky' }, 1: { icon: '🌤️', desc: 'Mainly clear' },
      2: { icon: '⛅', desc: 'Partly cloudy' }, 3: { icon: '☁️', desc: 'Overcast' },
      45: { icon: '🌫️', desc: 'Fog' }, 48: { icon: '🌫️', desc: 'Fog' },
      51: { icon: '🌦️', desc: 'Light drizzle' }, 53: { icon: '🌦️', desc: 'Drizzle' },
      61: { icon: '🌧️', desc: 'Slight rain' }, 63: { icon: '🌧️', desc: 'Rain' },
      65: { icon: '🌧️', desc: 'Heavy rain' }, 71: { icon: '🌨️', desc: 'Slight snow' },
      73: { icon: '🌨️', desc: 'Snow' }, 80: { icon: '🌦️', desc: 'Rain showers' },
      95: { icon: '⛈️', desc: 'Thunderstorm' }, 99: { icon: '⛈️', desc: 'Thunderstorm' }
    };
    return map[code] || { icon: '🌡️', desc: 'Kansas City' };
  }
  async function fetchWeather() {
    if (weatherDesc) weatherDesc.textContent = 'Updating…';
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=39.0997&longitude=-94.5786&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago';
      const res = await fetch(url);
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m);
      const { icon, desc } = weatherFromCode(data.current.weather_code);
      if (weatherTemp) weatherTemp.textContent = temp + '°F';
      if (weatherIcon) weatherIcon.textContent = icon;
      if (weatherDesc) weatherDesc.textContent = desc;
    } catch (err) {
      if (weatherDesc) weatherDesc.textContent = 'KC · retrying';
      setTimeout(fetchWeather, 10000);
    }
  }
  fetchWeather();
  setInterval(fetchWeather, 10 * 60 * 1000);

  const widget = document.getElementById('weatherWidget');
  const widgetToggle = document.getElementById('widgetToggle');
  const reopenBtn = document.createElement('button');
  reopenBtn.className = 'weather-reopen';
  reopenBtn.setAttribute('aria-label', 'Show time and weather');
  reopenBtn.innerHTML = '🕒';
  document.body.appendChild(reopenBtn);
  widgetToggle?.addEventListener('click', () => {
    widget?.classList.add('collapsed');
    reopenBtn.classList.add('visible');
  });
  reopenBtn.addEventListener('click', () => {
    widget?.classList.remove('collapsed');
    reopenBtn.classList.remove('visible');
  });
});
  </script>
</body>
</html>
