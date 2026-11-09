import { ArrowUpRight, ArrowRight, Play, Users, MessageCircle, MoveUpRight, X, Sparkles } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import './Home.css';

const Homepage = () => {
  const { login, register } = useKindeAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const dialogRef = useRef(null);
  const previewButton = useRef(null);
  useEffect(() => {
    if (previewOpen) dialogRef.current?.showModal();
    else if (dialogRef.current?.open) dialogRef.current.close();
  }, [previewOpen]);
  const openPreview = () => { previewButton.current = document.activeElement; setPreviewOpen(true); };
  const closePreview = () => { setPreviewOpen(false); previewButton.current?.focus(); };

  return (
    <div className="landing">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header wrap">
        <a className="wordmark" href="/" aria-label="Metaverse home"><span className="brand-icon" aria-hidden="true"><i /><i /><i /><i /></span>metaverse<span className="logo-period">.</span></a>
        <nav className="main-nav" aria-label="Main navigation"><a href="#why">Why Metaverse?</a><a href="#how">How it works</a></nav>
        <div className="nav-actions"><button className="login" onClick={login}>Log in</button><button className="button button-small" onClick={register}>Get started <ArrowUpRight size={17} /></button></div>
      </header>

      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> A LITTLE CLOSER. WHEREVER YOU ARE.</div>
            <h1>Remote work.<br />Real <span className="connection">connection<svg viewBox="0 0 460 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 12Q210 -4 452 10M20 19Q250 7 420 16" /></svg></span><span className="lilac-dot">.</span></h1>
            <p>Your team deserves more than another tab.<br className="desktop-break" /> Step into a shared virtual space to work, talk,<br className="desktop-break" /> and feel a little more together.</p>
            <div className="hero-actions"><button className="button" onClick={register}>Find your together <ArrowUpRight size={20} /></button><button className="watch-button" onClick={openPreview}><span className="play-circle"><Play size={13} fill="currentColor" /></span>Take a peek</button></div>
            <div className="hero-note"><span className="mini-avatars" aria-hidden="true"><img src="/front.PNG" alt="" /><img src="/right.png" alt="" /><img src="/back.png" alt="" /></span><span>Different places. Same team.</span><span className="note-spark" aria-hidden="true">✳</span></div>
          </div>

          <div className="world-art" role="img" aria-label="Playful illustration of teammates sharing a virtual workspace">
            <div className="art-orbit" /><span className="art-star star-one">✳</span><span className="art-star star-two">✧</span>
            <div className="floating-note note-top"><span className="status-dot" /> Your people, one little world</div>
            <div className="room">
              <div className="room-top"><span className="window"><i /><i /><i /></span><span className="wall-art">GOOD<br />TOGETHER <span>✳</span></span></div>
              <div className="room-floor">
                <div className="rug"><span>the good idea zone</span></div>
                <div className="desk desk-one"><span className="monitor" /><span className="keyboard" /><span className="coffee" /></div>
                <div className="desk desk-two"><span className="monitor" /><span className="keyboard" /><span className="coffee" /></div>
                <div className="sofa"><i /><i /><i /></div><div className="coffee-table"><span>✿</span></div>
                <span className="plant plant-one">✳</span><span className="plant plant-two">✳</span>
                <div className="person person-one"><span className="chat-bubble">Hey, you made it! <span>✦</span></span><img src="/front.PNG" alt="" /><span className="name-tag">Alex</span></div>
                <div className="person person-two"><img src="/right.png" alt="" /><span className="name-tag">Sam</span></div>
                <div className="person person-three"><img src="/back.png" alt="" /><span className="name-tag you-tag">You</span></div>
              </div>
            </div>
            <div className="floating-note note-bottom"><span className="wave">✋</span><div>A little less remote.<br /><strong>A lot more human.</strong></div></div>
            <span className="art-caption">A small world. A big sense of belonging.</span>
            <svg className="doodle-arrow" viewBox="0 0 90 80" aria-hidden="true"><path d="M5 5q65 5 35 45q-15 20 33 11m-15-12 17 11-15 13" /></svg>
          </div>
        </section>

        <div className="together-strip"><div className="wrap"><span>LESS DISTANCE.</span><span className="strip-flower">✳</span><span>MORE “GOT A MINUTE?”</span><span className="strip-flower">✳</span><span>BETTER TOGETHER.</span><span className="strip-flower">✳</span><span>THAT’S THE IDEA.</span></div></div>

        <section className="why-section wrap" id="why"><div className="section-intro"><div><div className="eyebrow">SAME TEAM. NEW KIND OF SPACE.</div><h2>Make room for<br />the human stuff<span className="lilac-dot">.</span></h2></div><p>The quick hellos. The shared ideas. The catch-ups<br className="desktop-break" /> that make work feel less like working alone.<br className="desktop-break" /> There’s a place for all of it here.</p></div>
          <div className="benefit-grid"><article className="benefit-card peach"><span className="benefit-icon"><Users size={25} /></span><span className="card-number">01 / SHOW UP</span><h3>A place to call yours.</h3><p>Create a virtual space and give your distributed team a shared place to land.</p><div className="card-doodle" aria-hidden="true">⌂</div></article><article className="benefit-card lavender"><span className="benefit-icon"><MoveUpRight size={25} /></span><span className="card-number">02 / WANDER OVER</span><h3>A little more presence.</h3><p>Move your character around, and explore a world alongside your teammates.</p><div className="character-line" aria-hidden="true"><img src="/right.png" alt="" /><span>· · · · · →</span><img src="/front.PNG" alt="" /></div></article><article className="benefit-card green"><span className="benefit-icon"><MessageCircle size={25} /></span><span className="card-number">03 / SAY HELLO</span><h3>Turn a hello into a chat.</h3><p>Bring your conversations to life with video and audio calls, right from your space.</p><div className="bubble-doodle" aria-hidden="true">hi!<span>hey ☺</span></div></article></div>
        </section>

        <section className="how-section wrap" id="how"><div className="preview-card"><div className="preview-bar"><span><i /><i /><i /></span><span>A peek inside Metaverse</span><Sparkles size={16} /></div><button className="video-preview" aria-label="Play the Metaverse product preview" onClick={openPreview}><img src="/preview-poster.jpg" alt="The actual Metaverse pixel world, with rooms to explore and a player character" loading="lazy" /><span className="preview-play"><Play size={23} fill="currentColor" /></span><span className="preview-label">See the space in action</span></button></div><div className="how-copy"><div className="eyebrow">FROM “WHERE ARE YOU?” TO “SEE YOU THERE.”</div><h2>Your next hangout<br />is a few clicks away.</h2><ol><li><span>1</span><div><h3>Make yourself at home</h3><p>Sign up and create your team’s space.</p></div></li><li><span>2</span><div><h3>Bring your people</h3><p>Share your space link or room ID with your team.</p></div></li><li><span>3</span><div><h3>Find your together</h3><p>Jump in, explore, and start a conversation.</p></div></li></ol><button className="text-link" onClick={register}>Let’s make some room <ArrowRight size={18} /></button></div></section>

        <section className="final-cta wrap"><span className="cta-flower" aria-hidden="true">✳</span><div className="eyebrow">A SHARED SPACE FOR YOUR KIND OF PEOPLE.</div><h2>See you in there<span>?</span></h2><p>Bring the team. We’ll bring the together.</p><button className="button" onClick={register}>Create your space <ArrowUpRight size={20} /></button><span className="cta-doodle" aria-hidden="true">☺</span></section>
      </main>
      <footer className="site-footer wrap"><a className="wordmark" href="/">metaverse<span className="logo-period">.</span></a><span>Made for people, wherever they are.</span><a href="#main">Back to top ↑</a></footer>
      <dialog aria-labelledby="preview-title" className="preview-dialog" ref={dialogRef} onCancel={closePreview} onClose={closePreview} onClick={e => { if (e.target === e.currentTarget) closePreview(); }}><div className="dialog-heading"><h2 id="preview-title">A peek inside Metaverse</h2><button onClick={closePreview} aria-label="Close preview"><X /></button></div>{previewOpen && <video src="/video/preview.mp4" poster="/preview-poster.jpg" controls autoPlay playsInline aria-label="Metaverse product preview" />}<p>Your virtual space, in action.</p></dialog>
    </div>
  );
};
export default Homepage;
