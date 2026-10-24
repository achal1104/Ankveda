import {useState,useEffect,createContext,useContext} from 'react';
import {Routes,Route,Link,NavLink,useParams,useLocation} from 'react-router-dom';
import {T,N,SX,PL,PN} from './data/content.js';
import {calculateNameNumber,translit,METHODS} from './lib/engine.js';
import './styles.css';

const Ctx=createContext();const useL=()=>useContext(Ctx);
const PATHS=['/','/name-numerology','/how','/about','/faq'];
const DEVA=/[\u0900-\u097F]/;
const List=({a})=><ul>{a.map((x,i)=><li key={i}>{x}</li>)}</ul>;

export default function App(){
  const [lang,setLang]=useState(()=>{try{return localStorage.getItem('av-lang')||'en'}catch{return 'en'}});
  const [method,setMethod]=useState('chaldean');
  useEffect(()=>{try{localStorage.setItem('av-lang',lang)}catch{}
    document.documentElement.lang=lang;document.body.className=lang;
    document.title=lang==='mr'?'AnkVeda — तुमच्या अंकांमागचा अर्थ':'AnkVeda — Discover the Meaning Behind Your Numbers'},[lang]);
  const dig=n=>lang==='mr'?String(n).replace(/\d/g,d=>'०१२३४५६७८९'[d]):n;
  const v={lang,setLang,method,setMethod,t:T[lang],s:SX[lang],dig};
  return <Ctx.Provider value={v}><ScrollTop/><Header/><main><Routes>
    <Route path="/" element={<Home/>}/><Route path="/name-numerology" element={<><Calc/><Table/></>}/>
    <Route path="/how" element={<How/>}/><Route path="/faq" element={<Faq/>}/>
    <Route path="/number/:n" element={<NumPage/>}/>
    <Route path="/about" element={<Page k="ab"/>}/><Route path="/privacy" element={<Page k="pr"/>}/>
    <Route path="/terms" element={<Page k="te"/>}/><Route path="/contact" element={<Page k="co"/>}/>
    <Route path="*" element={<Home/>}/></Routes></main><Footer/></Ctx.Provider>;
}
function ScrollTop(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0)},[pathname]);return null}

function Logo(){return <Link className="logo" to="/"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="none" style={{stroke:'var(--sec)'}} strokeWidth="2"/><path d="M15 6v18M9 11l6-5M10 21h10" style={{stroke:'var(--pri)'}} strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>AnkVeda</Link>}
function LangSwitch(){const {lang,setLang}=useL();return <div className="lang" role="group" aria-label="Language">
  {[['en','English'],['mr','मराठी']].map(([k,n])=><button key={k} className={lang===k?'on':''} aria-pressed={lang===k} onClick={()=>setLang(k)}>{n}</button>)}</div>}
function Header(){const {t}=useL();const [open,setOpen]=useState(false);const close=()=>setOpen(false);
  return <header><div className="w bar"><Logo/>
    <nav id="nav" className={open?'open':''} aria-label="Main">{t.nav.map((x,i)=><NavLink key={i} to={PATHS[i]} end onClick={close}>{x}</NavLink>)}
      <Link className="btn" to="/name-numerology" onClick={close}>{t.cta}</Link></nav>
    <LangSwitch/><button id="mb" aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)}>☰</button></div></header>}

function Hero(){const {t,s}=useL();return <section className="hs"><div className="w hero"><div>
  {s.badges.map((b,i)=><span className="eye" key={i}>{b}</span>)}<h1>{t.h1}</h1><p className="mu">{t.sub}</p>
  <p><button className="btn" onClick={()=>document.getElementById('calc')?.scrollIntoView({behavior:'smooth'})}>{t.cta}</button></p></div>
  <div className="card demo"><h3>{s.hcl}</h3><List a={s.frees}/></div></div></section>}

function Chips({r}){const {dig}=useL();return <div className="chips">{r.letters.map((l,i)=><div className="chip" key={i}>{l.letter}<b>{dig(l.value)}</b></div>)}</div>}
function Result({r,onAgain}){const {lang,t,dig}=useL();const I=N[lang][r.number-1];
  const st=r.steps.slice(1).map((x,i)=>`${[...String(r.steps[i])].map(dig).join(' + ')} = ${dig(x)}`).join(', ');
  return <div className="card res" aria-live="polite"><h3>{t.res}: {r.input}</h3><div className="big">{dig(r.number)}</div>
    <p className="mu">{t.meth[r.method]} · {t.total}: <b>{dig(r.total)}</b></p><h4>{t.mapping}</h4><Chips r={r}/>
    <h4>{t.calcs}</h4><p>{r.letters.map(l=>dig(l.value)).join(' + ')} = {dig(r.total)}{st&&`, ${st}`}</p>
    <h4>{t.mean}: {I[0]}</h4><p>{I[1]}</p><p><b>{t.str}:</b> {I[2]}</p><p><b>{t.chl}:</b> {I[3]}</p><p><b>{t.refl}:</b> {I[4]}</p>
    <p className="note">{t.disc}</p><p className="np"><Link className="btn o" to={`/number/${r.number}`}>{t.open}</Link> <button className="btn o" onClick={()=>window.print()}>{t.print}</button> <button className="btn" onClick={onAgain}>{t.again}</button></p></div>}

function Calc(){const {t,s,method,setMethod}=useL();
  const [v,setV]=useState(''),[r,setR]=useState(null),[err,setErr]=useState(null),[note,setNote]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{const id=setTimeout(()=>{if(!v.trim()||DEVA.test(v))return;const x=calculateNameNumber(v,method);if(!x.error){setR(x);setErr(null)}},250);return()=>clearTimeout(id)},[v,method]);
  const submit=e=>{e.preventDefault();setR(null);setNote(false);
    if(DEVA.test(v)){setV(translit(v));setNote(true);setErr(null);return}
    const x=calculateNameNumber(v,method);if(x.error){setErr(x);return}
    setErr(null);setBusy(true);setTimeout(()=>{setR(x);setBusy(false)},350)};
  const msg=!err?'':err.error==='empty'?t.eEmpty:err.error==='bad'?t.eBad+err.bad.join(' '):t.eNone;
  return <section id="calc"><div className="w"><div className="card"><h2>{s.chk}</h2>
    <form onSubmit={submit} noValidate><div className="row">
      <div><label htmlFor="nm-in">{t.nl}</label><input id="nm-in" value={v} onChange={e=>setV(e.target.value)} autoComplete="off" placeholder={t.ph} aria-describedby="msg"/></div>
      <div><label htmlFor="mt">{t.ml}</label><select id="mt" value={method} onChange={e=>setMethod(e.target.value)}>{['chaldean','pythagorean'].map(k=><option key={k} value={k}>{t.meth[k]}</option>)}</select></div></div>
      <div id="msg" role="alert" aria-live="polite">{msg&&<p className="err">{msg}</p>}{note&&<p className="note">{t.tNote}</p>}</div>
      <p><button className="btn" type="submit">{t.calc}</button> <button className="btn o" type="button" onClick={()=>setV('Rahul Sharma')}>{t.ex}</button></p></form>
    <div aria-live="polite">{busy&&<p>{t.wait}</p>}{r&&!busy&&<Result r={r} onAgain={()=>{setR(null);setV('');document.getElementById('nm-in')?.focus()}}/>}</div></div></div></section>}

function Story(){const {s,dig,method}=useL();
  const F=({n})=>{const r=calculateNameNumber(n,method);return <div className="card tr2"><b>{n}</b><span className="mu">{r.letters.map(l=>dig(l.value)).join(' + ')} = {dig(r.total)}</span><span className="n">{dig(r.number)}</span></div>};
  return <><section><div className="w"><h2>{s.q}</h2><div className="grid">{s.qs.map((x,i)=><div className="card" key={i}>{x}</div>)}</div><p className="note">{s.qn}</p></div></section>
  <section><div className="w"><h2>{s.idea}</h2><p>{s.ideat}</p><h3>{s.one}</h3><p className="mu">{s.onet}</p><div className="grid"><F n="ASHISH"/><F n="AASHISH"/></div></div></section></>}
function Free(){const {s}=useL();return <section><div className="w"><h2>{s.free}</h2><div className="card"><List a={s.frees}/><p className="note">{s.not}</p></div></div></section>}
function How(){const {t,dig}=useL();return <section id="how"><div className="w"><h2>{t.how}</h2><div className="grid">{t.steps.map((x,i)=><div className="card" key={i}><span className="n">{dig(i+1)}</span><h3>{x[0]}</h3><p className="mu">{x[1]}</p></div>)}</div></div></section>}
function Trust(){const {s}=useL();return <section><div className="w"><div className="grid"><div className="card"><h3>{s.trust}</h3><List a={s.trusts}/></div><div className="card"><h3>{s.nothing}</h3><List a={s.nots}/></div></div></div></section>}
function Faq(){const {t}=useL();const [o,setO]=useState(0);
  return <section id="faq"><div className="w"><h2>{t.faq}</h2>{t.faqs.map((f,i)=><div className={'fq'+(o===i?' open':'')} key={i}>
    <button className="fqb" aria-expanded={o===i} aria-controls={'fa'+i} onClick={()=>setO(o===i?-1:i)}>{f[0]}<span aria-hidden="true">+</span></button>
    <div className="fqa" id={'fa'+i} role="region"><p>{f[1]}</p></div></div>)}</div></section>}
function Band(){const {t}=useL();return <section><div className="w"><div className="band"><h2>{t.ct}</h2><p>{t.tag}</p><Link className="btn" to="/name-numerology">{t.cta}</Link></div></div></section>}
function Table(){const {t,s,method,dig}=useL();const g={};for(const[l,x]of Object.entries(METHODS[method]))(g[x]=g[x]||[]).push(l);
  return <section><div className="w"><h2>{s.tb}</h2><p className="mu">{t.meth[method]}</p><div className="mt">{Object.keys(g).map(k=><div className="card tr" key={k}><span className="n">{dig(k)}</span><b>{g[k].join(' · ')}</b></div>)}</div></div></section>}
function NumPage(){const {n}=useParams();const {lang,t,dig}=useL();const k=/^[1-9]$/.test(n)?+n:0;
  if(!k)return <Page k="nm" body={t.nmd}/>;const I=N[lang][k-1];
  return <section><div className="w"><Link to="/">{t.back}</Link><div className="card"><span className="big">{dig(k)}</span><h1>{I[0]}</h1><small className="pl">{PL[k-1]} {PN[lang][k-1]}</small><p>{I[1]}</p><p><b>{t.str}:</b> {I[2]}</p><p><b>{t.chl}:</b> {I[3]}</p><p><b>{t.refl}:</b> {I[4]}</p><p className="note">{t.disc}</p></div></div></section>}
function Page({k,body}){const {t}=useL();const h=t[k]||t.nm;return <section><div className="w"><h1>{h}</h1><div className="card"><p>{body||t[k+'t']}</p></div></div></section>}
function Home(){return <><Hero/><Calc/><Story/><Free/><How/><Trust/><Faq/><Band/></>}
function Footer(){const {t}=useL();return <footer><div className="w grid"><div><Logo/><p>{t.tag}</p><LangSwitch/></div>
  <div><b>{t.foot}</b>{t.nav.map((x,i)=><Link key={i} to={PATHS[i]}>{x}</Link>)}</div>
  <div><Link to="/privacy">{t.pr}</Link><Link to="/terms">{t.te}</Link><Link to="/contact">{t.co}</Link></div>
  <div><p>{t.disc}</p><p>{t.copy}</p></div></div></footer>}
