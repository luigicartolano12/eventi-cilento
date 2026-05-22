"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUtente } from "@/lib/utente";
import { CATEGORIE } from "@/lib/events";
import type { EventoDinamico } from "@/lib/eventi-dinamici";
import type { Proposta } from "@/lib/kv-proposte";
import {
  IcoArrowLeft, IcoCheck, IcoCalendar, IcoMapPin, IcoClock,
  IcoCamera, IcoSparkle, IcoDownload, IcoSend,
} from "@/app/components/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Costanti
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "crea" | "proposte" | "archivio" | "cron";

const CAT_STILE: Record<string, { bg: string; color: string }> = {
  Sagra:     { bg: "#fff7ed", color: "#c2410c" },
  Musica:    { bg: "#faf5ff", color: "#7c3aed" },
  Cultura:   { bg: "#eff6ff", color: "#1d4ed8" },
  Sport:     { bg: "#f0fdf4", color: "#15803d" },
  Religioso: { bg: "#fefce8", color: "#a16207" },
  Mercato:   { bg: "#fdf2f8", color: "#be185d" },
  Natura:    { bg: "#ecfdf5", color: "#065f46" },
  Salute:    { bg: "#fdf2f8", color: "#9d174d" },
};
const GRAD: Record<string, string> = {
  Sagra:"linear-gradient(135deg,#fb923c,#fbbf24)",
  Musica:"linear-gradient(135deg,#a855f7,#818cf8)",
  Cultura:"linear-gradient(135deg,#3b82f6,#22d3ee)",
  Sport:"linear-gradient(135deg,#22c55e,#10b981)",
  Religioso:"linear-gradient(135deg,#facc15,#f59e0b)",
  Mercato:"linear-gradient(135deg,#f472b6,#fb7185)",
  Natura:"linear-gradient(135deg,#059669,#14b8a6)",
  Salute:"linear-gradient(135deg,#ec4899,#f43f5e)",
};
const COMUNI = [
  "Agropoli","Alfano","Ascea","Camerota","Capaccio-Paestum","Casal Velino",
  "Castellabate","Centola","Ceraso","Cicerale","Futani","Gioi","Laureana Cilento",
  "Laurito","Lustra","Moio della Civitella","Montecorice","Morigerati","Novi Velia",
  "Ogliastro Cilento","Omignano","Orria","Perdifumo","Perito","Pisciotta",
  "Pollica","Prignano Cilento","Rofrano","Salento","San Giovanni a Piro",
  "San Mauro la Bruca","Santa Marina","Stella Cilento","Stio","Torchiara",
  "Torre Orsaia","Torraca","Vallo della Lucania",
  "Atena Lucana","Buonabitacolo","Casalbuono","Monte San Giacomo",
  "Montesano sulla Marcellana","Padula","Pertosa","Polla","Sala Consilina",
  "San Pietro al Tanagro","San Rufo","Sant'Arsenio","Sassano","Sanza","Teggiano",
  "Ispani","Sapri","Vibonati",
];
const IS = { background:"#f5f3ef", fontSize:15 } as React.CSSProperties; // input style
const CL = "w-full rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none";
const LB = "text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 block";

// ─────────────────────────────────────────────────────────────────────────────
// Form evento riutilizzabile
// ─────────────────────────────────────────────────────────────────────────────
type F = {
  titolo:string; data:string; dataFine:string; orario:string;
  comune:string; luogo:string; categoria:string; descrizione:string;
  gratuito:boolean; prezzo:string; linkEsterno:string;
  organizzatore:string; telefono:string; email:string;
};
const VUOTO:F = {
  titolo:"", data:"", dataFine:"", orario:"", comune:"", luogo:"",
  categoria:"", descrizione:"", gratuito:true, prezzo:"", linkEsterno:"",
  organizzatore:"", telefono:"", email:"",
};

function FormEvento({ init, onSalva, btnLabel="Pubblica evento", busy }:{
  init?:Partial<F>; onSalva:(d:F)=>Promise<void>; btnLabel?:string; busy?:boolean;
}) {
  const [f, setF] = useState<F>({...VUOTO,...init});
  const [err, setErr] = useState("");
  const s = <K extends keyof F>(k:K, v:F[K]) => setF(p=>({...p,[k]:v}));

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (!f.titolo||!f.data||!f.comune||!f.categoria||!f.descrizione) {
      setErr("Compila i campi obbligatori (*)"); return;
    }
    setErr("");
    await onSalva(f);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Titolo */}
      <div>
        <label className={LB}>Titolo *</label>
        <input value={f.titolo} onChange={e=>s("titolo",e.target.value)}
          placeholder="Nome evento" className={CL} style={IS} required />
      </div>
      {/* Date */}
      <div className="grid grid-cols-3 gap-2">
        {(["data","dataFine","orario"] as const).map((c,i)=>(
          <div key={c}>
            <label className={LB}>{["Data inizio *","Data fine","Orario"][i]}</label>
            <input type={i<2?"date":"time"} value={f[c] as string}
              onChange={e=>s(c,e.target.value)} className={CL}
              style={{...IS,colorScheme:"light"}} required={c==="data"} />
          </div>
        ))}
      </div>
      {/* Comune + Luogo */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LB}>Comune *</label>
          <input value={f.comune} onChange={e=>s("comune",e.target.value)}
            placeholder="es. Pisciotta" list="cl-comuni"
            className={CL} style={IS} required />
          <datalist id="cl-comuni">{COMUNI.map(c=><option key={c} value={c}/>)}</datalist>
        </div>
        <div>
          <label className={LB}>Luogo</label>
          <input value={f.luogo} onChange={e=>s("luogo",e.target.value)}
            placeholder="es. Piazza Municipio" className={CL} style={IS} />
        </div>
      </div>
      {/* Categoria */}
      <div>
        <label className={LB}>Categoria *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIE.map(cat=>(
            <button key={cat} type="button" onClick={()=>s("categoria",cat)}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer transition-all"
              style={f.categoria===cat ? {background:GRAD[cat]??"#16a34a",color:"white"}
                                       : {background:"#f5f3ef",color:"#78716c"}}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Descrizione */}
      <div>
        <label className={LB}>Descrizione *</label>
        <textarea value={f.descrizione} onChange={e=>s("descrizione",e.target.value)}
          placeholder="Descrizione dell'evento…" rows={3}
          className={CL} style={{...IS,resize:"vertical"}} required />
      </div>
      {/* Gratuito / Prezzo / Link */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative shrink-0 transition-colors duration-200"
            style={{width:38,height:21,borderRadius:11,background:f.gratuito?"#a3e635":"#e5e7eb"}}>
            <div className="absolute bg-white rounded-full shadow transition-transform duration-200"
              style={{width:15,height:15,top:3,transform:f.gratuito?"translateX(20px)":"translateX(3px)"}}/>
            <input type="checkbox" checked={f.gratuito} onChange={e=>s("gratuito",e.target.checked)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
          </div>
          <span className="text-sm font-bold text-stone-700">Ingresso gratuito</span>
        </label>
        {!f.gratuito && <input value={f.prezzo} onChange={e=>s("prezzo",e.target.value)}
          placeholder="Prezzo (es. €5)" className={CL} style={IS}/>}
        <input value={f.linkEsterno} onChange={e=>s("linkEsterno",e.target.value)}
          placeholder="Link sito / prenotazione (opzionale)" type="url" className={CL} style={IS}/>
      </div>
      {/* Organizzatore */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3">
          <label className={LB}>Organizzatore</label>
          <input value={f.organizzatore} onChange={e=>s("organizzatore",e.target.value)}
            placeholder="Pro Loco, Comune, Associazione…" className={CL} style={IS}/>
        </div>
        <input value={f.telefono} onChange={e=>s("telefono",e.target.value)}
          placeholder="Telefono" type="tel" className={CL} style={IS}/>
        <div className="col-span-2">
          <input value={f.email} onChange={e=>s("email",e.target.value)}
            placeholder="Email" type="email" className={CL} style={IS}/>
        </div>
      </div>
      {err && <p className="text-sm px-4 py-3 rounded-2xl" style={{background:"#fef2f2",color:"#dc2626"}}>⚠️ {err}</p>}
      <button type="submit" disabled={busy}
        className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{background:"#16a34a",color:"white"}}>
        {busy
          ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Salvataggio…</>
          : <><IcoCheck size={15}/>{btnLabel}</>}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB CREA
// ─────────────────────────────────────────────────────────────────────────────
function TabCrea({onSuccess}:{onSuccess:()=>void}) {
  const [modo, setModo] = useState<"manuale"|"scan">("manuale");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [prefill, setPrefill] = useState<Partial<F>|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string|null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanErr, setScanErr] = useState("");

  async function salva(dati:F) {
    setBusy(true);
    try {
      const res = await fetch("/api/eventi-admin",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(dati),
      });
      if (!res.ok) { const d=await res.json(); throw new Error(d.errore); }
      setOk(true);
      setTimeout(()=>{setOk(false);setPrefill(null);setPreview(null);onSuccess();},1800);
    } catch(err){ alert(err instanceof Error?err.message:"Errore"); }
    finally{ setBusy(false); }
  }

  async function analizzaFoto(file:File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setScanning(true); setScanErr("");
      try {
        const [hdr,b64] = dataUrl.split(",");
        const mt = hdr.match(/data:([^;]+)/)?.[1]??"image/jpeg";
        const res = await fetch("/api/leggi-locandina",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({image:b64,mediaType:mt}),
        });
        const d = await res.json();
        if (!res.ok||!d.ok) throw new Error(d.errore);
        const ev = d.evento;
        setPrefill({
          titolo:ev.titolo??"", data:ev.data??"", dataFine:ev.dataFine??"",
          orario:ev.orario??"", comune:ev.comune??"", luogo:ev.luogo??"",
          categoria:ev.categoria??"", descrizione:ev.descrizione??"",
          gratuito:ev.gratuito??true, prezzo:ev.prezzo??"",
          linkEsterno:ev.sito??"", organizzatore:ev.organizzatore??"",
          telefono:ev.telefono??"", email:ev.email??"",
        });
        setModo("manuale");
      } catch(err){ setScanErr(err instanceof Error?err.message:"Errore lettura"); }
      finally{ setScanning(false); }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Modo toggle */}
      <div className="flex rounded-2xl p-1 gap-1" style={{background:"#f5f3ef"}}>
        {(["manuale","scan"] as const).map((m,i)=>(
          <button key={m} onClick={()=>setModo(m)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
            style={modo===m?{background:"white",color:"#1a3529",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}
                          :{background:"transparent",color:"#78716c"}}>
            {["✏️ Form manuale","📷 Scansiona locandina"][i]}
          </button>
        ))}
      </div>

      {/* Scan */}
      {modo==="scan" && (
        <div className="flex flex-col gap-4">
          {!preview ? (
            <div onClick={()=>inputRef.current?.click()}
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)analizzaFoto(f);}}
              onDragOver={e=>e.preventDefault()}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed cursor-pointer transition-colors hover:border-purple-400"
              style={{height:180,borderColor:"rgba(0,0,0,0.12)",background:"white"}}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:"#f3e8ff"}}>
                <IcoCamera size={24} style={{color:"#a855f7"}}/>
              </div>
              <div className="text-center">
                <p className="font-bold text-stone-700 text-sm">Trascina o clicca per caricare</p>
                <p className="text-xs mt-1 text-stone-400">JPG, PNG, WEBP · max 10MB</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e=>{const f=e.target.files?.[0];if(f)analizzaFoto(f);}}/>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden" style={{background:"#e7e5e4"}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Locandina" className="w-full object-contain" style={{maxHeight:280}}/>
              <button onClick={()=>{setPreview(null);setPrefill(null);}}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-0 cursor-pointer"
                style={{background:"rgba(0,0,0,0.5)",color:"white"}}>×</button>
            </div>
          )}
          {scanning && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:"#f3e8ff"}}>
              <span className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin"/>
              <span className="text-sm font-semibold" style={{color:"#7c3aed"}}>AI legge la locandina…</span>
            </div>
          )}
          {scanErr && <p className="text-sm px-4 py-3 rounded-2xl" style={{background:"#fef2f2",color:"#dc2626"}}>⚠️ {scanErr}</p>}
          {prefill && <p className="text-sm px-4 py-3 rounded-2xl flex items-center gap-2" style={{background:"#dcfce7",color:"#166534"}}>
            <IcoSparkle size={14}/> Dati estratti — controlla e modifica se necessario
          </p>}
        </div>
      )}

      {/* Form */}
      {(modo==="manuale"||prefill) && (
        <>
          {ok && <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{background:"#dcfce7",color:"#166534"}}>
            <IcoCheck size={15}/> Evento pubblicato!
          </div>}
          <FormEvento init={prefill??{}} onSalva={salva} busy={busy}/>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB PROPOSTE
// ─────────────────────────────────────────────────────────────────────────────
function TabProposte({refreshKey}:{refreshKey:number}) {
  const [proposte, setProposte] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string|null>(null);
  const [filtro, setFiltro] = useState<"in_attesa"|"approvata"|"rifiutata">("in_attesa");
  const [modifica, setModifica] = useState<Proposta|null>(null);

  const carica = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/proposte"); setProposte(await r.json()); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ carica(); },[carica,refreshKey]);

  async function azione(id:string, stato:string) {
    setBusy(id);
    await fetch(`/api/proposte/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stato})});
    await carica(); setBusy(null);
  }
  async function elimina(id:string) {
    if(!confirm("Eliminare?")) return;
    setBusy(id);
    await fetch(`/api/proposte/${id}`,{method:"DELETE"});
    await carica(); setBusy(null);
  }
  async function approvaConMod(dati:F) {
    if(!modifica) return;
    await fetch(`/api/proposte/${modifica.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...dati,stato:"approvata"})});
    setModifica(null); await carica();
  }

  const attesa = proposte.filter(p=>p.stato==="in_attesa").length;
  const filtrate = proposte.filter(p=>p.stato===filtro);

  if (modifica) return (
    <div>
      <button onClick={()=>setModifica(null)} className="flex items-center gap-1.5 text-sm font-bold mb-5 border-0 bg-transparent cursor-pointer" style={{color:"#16a34a"}}>
        <IcoArrowLeft size={13}/> Torna
      </button>
      <p className={LB + " mb-4"}>Modifica e approva</p>
      <FormEvento
        init={{titolo:modifica.titolo,data:modifica.data,dataFine:modifica.dataFine,
          orario:modifica.orario,comune:modifica.comune,luogo:modifica.luogo,
          categoria:modifica.categoria,descrizione:modifica.descrizione,
          gratuito:modifica.gratuito,prezzo:modifica.prezzo,linkEsterno:modifica.linkEsterno,
          organizzatore:modifica.organizzatore,telefono:modifica.telefono,email:modifica.email}}
        onSalva={approvaConMod} btnLabel="Approva e pubblica" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 p-1 rounded-2xl" style={{background:"#f5f3ef"}}>
        {(["in_attesa","approvata","rifiutata"] as const).map(s=>(
          <button key={s} onClick={()=>setFiltro(s)}
            className="flex-1 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all"
            style={filtro===s?{background:"white",color:"#1a3529",boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}
                            :{background:"transparent",color:"#78716c"}}>
            {s==="in_attesa"?`In attesa (${attesa})`:s==="approvata"?"Approvate":"Rifiutate"}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-stone-400 text-center py-8">Caricamento…</p>}
      {!loading && filtrate.length===0 && (
        <p className="text-sm text-stone-400 text-center py-8">
          {filtro==="in_attesa"?"Nessuna proposta in attesa 🎉":"Nessuna proposta qui."}
        </p>
      )}
      {filtrate.map(p => {
        const st = CAT_STILE[p.categoria]??{bg:"#f5f3ef",color:"#44403c"};
        const invio = new Date(p.dataInvio).toLocaleDateString("it-IT",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
        return (
          <div key={p.id} className="bg-white rounded-3xl p-5 flex flex-col gap-3"
            style={{boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)",opacity:busy===p.id ? 0.5 : 1}}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={st}>{p.categoria}</span>
                <span className="text-[11px] text-stone-400">{p.data}{p.dataFine?` → ${p.dataFine}`:""}</span>
              </div>
              <span className="text-[10px] text-stone-300 shrink-0">{invio}</span>
            </div>
            <h3 className="text-[15px] font-black text-stone-900">{p.titolo}</h3>
            <div className="flex flex-wrap gap-x-3 text-[12px] text-stone-400">
              <span className="flex items-center gap-1"><IcoMapPin size={10}/>{p.luogo||p.comune} · {p.comune}</span>
              {p.orario&&<span className="flex items-center gap-1"><IcoClock size={10}/>{p.orario}</span>}
              {p.organizzatore&&<span className="font-semibold text-stone-500">{p.organizzatore}</span>}
            </div>
            <p className="text-[13px] text-stone-500 leading-relaxed">{p.descrizione}</p>
            {p.nota&&<p className="text-[12px] text-stone-400 italic">📌 {p.nota}</p>}
            {(p.telefono||p.email)&&(
              <div className="flex gap-3 text-[11px]">
                {p.telefono&&<a href={`tel:${p.telefono}`} className="text-stone-400 hover:text-stone-700">{p.telefono}</a>}
                {p.email&&<a href={`mailto:${p.email}`} className="text-stone-400 hover:text-stone-700">{p.email}</a>}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              {p.stato==="in_attesa"&&<>
                <button onClick={()=>azione(p.id,"rifiutata")} disabled={!!busy}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-0 cursor-pointer"
                  style={{background:"#fef2f2",color:"#dc2626"}}>Rifiuta</button>
                <button onClick={()=>setModifica(p)} disabled={!!busy}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-0 cursor-pointer"
                  style={{background:"#f5f3ef",color:"#44403c"}}>Modifica</button>
                <button onClick={()=>azione(p.id,"approvata")} disabled={!!busy}
                  className="flex-[2] py-2.5 rounded-2xl text-sm font-black border-0 cursor-pointer"
                  style={{background:"#a3e635",color:"#14532d"}}>✓ Approva</button>
              </>}
              {p.stato!=="in_attesa"&&(
                <button onClick={()=>elimina(p.id)} disabled={!!busy}
                  className="text-xs font-bold px-3 py-2 rounded-xl border-0 cursor-pointer ml-auto"
                  style={{background:"#fef2f2",color:"#dc2626"}}>Elimina</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB ARCHIVIO KV
// ─────────────────────────────────────────────────────────────────────────────
function TabArchivio({refreshKey}:{refreshKey:number}) {
  const [eventi, setEventi] = useState<EventoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [cerca, setCerca] = useState("");
  const [delId, setDelId] = useState<string|null>(null);

  const carica = useCallback(async()=>{
    setLoading(true);
    try { const r=await fetch("/api/eventi-admin"); setEventi(await r.json()); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ carica(); },[carica,refreshKey]);

  async function elimina(id:string) {
    if(!confirm("Rimuovere?")) return;
    setDelId(id);
    await fetch(`/api/eventi-admin?id=${id}`,{method:"DELETE"});
    await carica(); setDelId(null);
  }

  const oggi = new Date().toISOString().split("T")[0];
  const filtrati = eventi.filter(e=>!cerca||[e.titolo,e.comune,e.categoria].join(" ").toLowerCase().includes(cerca.toLowerCase()));
  const attivi = filtrati.filter(e=>(e.dataFine??e.data)>=oggi);
  const passati = filtrati.filter(e=>(e.dataFine??e.data)<oggi);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input value={cerca} onChange={e=>setCerca(e.target.value)}
          placeholder="Cerca per titolo, comune, categoria…"
          className={CL+" flex-1"} style={IS}/>
        <button onClick={()=>{if(confirm("Svuotare TUTTI gli eventi KV?"))fetch("/api/eventi-admin",{method:"DELETE"}).then(carica);}}
          className="shrink-0 text-xs font-bold px-3 py-2.5 rounded-2xl border-0 cursor-pointer"
          style={{background:"#fef2f2",color:"#dc2626"}}>Reset</button>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">
        {attivi.length} attivi · {passati.length} passati
      </p>
      {loading && <p className="text-sm text-stone-400 text-center py-6">Caricamento…</p>}
      {[{label:"Attivi",lista:attivi},{label:"Passati",lista:passati}].filter(g=>g.lista.length>0).map(({label,lista})=>(
        <div key={label}>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">{label} ({lista.length})</p>
          <div className="flex flex-col gap-2">
            {lista.map(e=>{
              const st=CAT_STILE[e.categoria]??{bg:"#f5f3ef",color:"#44403c"};
              return (
                <div key={e.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3"
                  style={{boxShadow:"0 1px 3px rgba(0,0,0,0.06)",opacity:delId===e.id ? 0.4 : 1}}>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={st}>{e.categoria}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-stone-900 truncate">{e.titolo}</p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                      <IcoCalendar size={10}/>{e.data}{e.dataFine?`→${e.dataFine}`:""}&nbsp;
                      <IcoMapPin size={10}/>{e.comune}
                    </p>
                  </div>
                  <button onClick={()=>elimina(e.id)} disabled={!!delId}
                    className="text-stone-300 hover:text-red-400 text-lg leading-none font-bold border-0 bg-transparent cursor-pointer shrink-0 transition-colors">×</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB AI / CRON
// ─────────────────────────────────────────────────────────────────────────────
function TabCron() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState<null|"light"|"full">(null);
  const [periodo, setPeriodo] = useState("");
  const [testo, setTesto] = useState("");
  const [importando, setImportando] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [resettando, setResettando] = useState(false);

  // ── Reset KV senza ricaricare ─────────────────────────────────────────────
  async function soloReset() {
    if (!confirm("Svuotare TUTTI gli eventi dal database? L'operazione è irreversibile.")) return;
    setResettando(true);
    setLog(["Reset KV in corso…"]);
    try {
      await fetch("/api/eventi-admin", { method: "DELETE" });
      setLog(["✓ Database svuotato. Lancia un cron per ricaricare gli eventi reali."]);
    } catch (err) {
      setLog([`✕ ${err instanceof Error ? err.message : "Errore reset"}`]);
    } finally {
      setResettando(false);
    }
  }

  // ── Cron veloce (solo scraping + haiku, ~20s) ────────────────────────────
  async function avviaLight(conReset = false) {
    if (conReset && !confirm("Questo svuoterà tutti gli eventi esistenti e ricaricherà con dati reali. Continuare?")) return;
    setRunning("light");
    setLog(conReset ? ["Reset + Ricarica in corso…"] : ["Cron veloce avviato…"]);
    try {
      const p = new URLSearchParams({ chiave: "cilento2025" });
      if (conReset) p.set("reset", "1");
      const r = await fetch(`/api/cron-light?${p}`);
      const d = await r.json();
      if (d.log) setLog(d.log);
      setLog(prev => [...prev, d.ok
        ? `✓ ${d.trovati} eventi trovati, ${d.nuovi} nuovi salvati (siti: ${d.funzionanti})`
        : `✕ ${d.messaggio}`]);
    } catch (err) {
      setLog(prev => [...prev, `✕ ${err instanceof Error ? err.message : "Errore"}`]);
    } finally {
      setRunning(null);
    }
  }

  // ── Cron completo (scraping + web search + opus, ~2min) ──────────────────
  async function avviaFull() {
    setRunning("full"); setLog(["Avvio pipeline completa (può richiedere ~2 minuti)…"]);
    try {
      const p = new URLSearchParams({ chiave: "cilento2025" });
      if (periodo) p.set("periodo", periodo);
      const r = await fetch(`/api/cron?${p}`);
      const d = await r.json();
      if (d.log) setLog(d.log);
      setLog(prev => [...prev, d.ok
        ? `✓ ${d.trovati} trovati, ${d.nuovi} nuovi — siti: ${d.sitiFunzionanti}`
        : `✕ ${d.messaggio}`]);
    } catch (err) {
      setLog(prev => [...prev, `✕ ${err instanceof Error ? err.message : "Errore"}`]);
    } finally {
      setRunning(null); }
  }

  async function importaDaTesto() {
    if (!testo.trim()) return;
    setImportando(true); setImportMsg("");
    try {
      const res = await fetch("/api/ai-eventi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `Estrai TUTTI gli eventi da questo testo e strutturali come eventi del Cilento:\n\n${testo.slice(0, 4000)}` }),
      });
      if (!res.ok || !res.body) throw new Error("API non disponibile");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
      }
      const matches = buf.match(/"tipo":"eventi"/g);
      setImportMsg(matches ? `✓ Eventi estratti e salvati per approvazione` : "Elaborazione completata");
    } catch (err) {
      setImportMsg(`✕ ${err instanceof Error ? err.message : "Errore"}`);
    } finally {
      setImportando(false);
    }
  }

  const isBusy = !!running || resettando;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Sezione Reset + Ricarica ───────────────────────────────────────── */}
      <div className="rounded-3xl p-5 flex flex-col gap-3" style={{background:"#fff7ed",border:"1px solid #fed7aa"}}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color:"#c2410c"}}>
            🔄 Reset database eventi
          </p>
          <p className="text-xs" style={{color:"#9a3412"}}>
            Svuota tutti gli eventi inventati dall&apos;AI e ricarica solo dati reali dai siti web.
          </p>
        </div>
        {/* Bottone principale: Reset + Ricarica in un click */}
        <button onClick={() => avviaLight(true)} disabled={isBusy}
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{background:"linear-gradient(135deg,#dc2626,#f97316)",color:"white"}}>
          {running === "light" && resettando === false
            ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Reset + Ricarica in corso…</>
            : <>🗑️ Reset + Ricarica reale (veloce, ~20s)</>}
        </button>
        {/* Bottone secondario: solo reset */}
        <button onClick={soloReset} disabled={isBusy}
          className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{background:"#fef2f2",color:"#dc2626"}}>
          {resettando
            ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-red-600 animate-spin"/>Reset in corso…</>
            : <>Solo svuota (senza ricaricare)</>}
        </button>
      </div>

      {/* ── Cron veloce ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          ⚡ Cron veloce — solo scraping
        </p>
        <p className="text-xs text-stone-400 -mt-1">
          Scraping 5 siti + AI haiku. Niente web search. ~20 secondi.
        </p>
        <button onClick={() => avviaLight(false)} disabled={isBusy}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)",color:"white"}}>
          {running === "light"
            ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Ricerca in corso…</>
            : <><IcoSparkle size={15}/>Aggiungi nuovi eventi (veloce)</>}
        </button>
      </div>

      {/* ── Cron completo ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          🔍 Cron completo — web search + scraping
        </p>
        <p className="text-xs text-stone-400 -mt-1">
          8 ricerche web + Claude Opus. Più risultati. Può richiedere fino a 2 minuti.
        </p>
        <input value={periodo} onChange={e => setPeriodo(e.target.value)}
          placeholder="Periodo opzionale (es. luglio 2026, estate 2026…)"
          className={CL} style={IS} />
        <button onClick={avviaFull} disabled={isBusy}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{background:"linear-gradient(135deg,#1a3529,#14532d)",color:"#a3e635"}}>
          {running === "full"
            ? <><span className="w-4 h-4 rounded-full border-2 border-lime-400/30 border-t-lime-400 animate-spin"/>Ricerca completa in corso…</>
            : <><IcoSparkle size={15}/>Avvia ricerca completa (web + scraping)</>}
        </button>
      </div>

      {/* Log ───────────────────────────────────────────────────────────────── */}
      {log.length > 0 && (
        <div className="rounded-2xl p-4 flex flex-col gap-1" style={{background:"#1a3529"}}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color:"#a3e635"}}>Log</p>
          {log.map((l, i) => (
            <p key={i} className="text-[12px] font-mono"
              style={{color: l.startsWith("✓") ? "#86efac" : l.startsWith("✕") ? "#fca5a5" : "#6ee7b7"}}>
              {l}
            </p>
          ))}
        </div>
      )}

      {/* Import da testo / Facebook / Instagram */}
      <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
            📋 Importa da testo / Facebook / Instagram
          </p>
          <p className="text-xs text-stone-400 mb-3">
            Incolla il testo di un post Facebook, un evento Instagram, una newsletter Pro Loco, una pagina web, un programma estivo — l&apos;AI estrae tutti gli eventi e li salva.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Post Facebook Pro Loco Teggiano estate 2026", "Programma eventi Sala Consilina luglio", "Newsletter Comune Padula"].map(ex => (
              <button key={ex} onClick={() => setTesto(ex)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer"
                style={{background:"#f5f3ef",color:"#78716c"}}>
                {ex}
              </button>
            ))}
          </div>
        </div>
        <textarea value={testo} onChange={e => setTesto(e.target.value)}
          placeholder="Incolla qui: testo di un post Facebook, testo di un evento Instagram, programma estivo del comune, newsletter Pro Loco, articolo di giornale locale…"
          rows={7} className={CL} style={{...IS, resize:"vertical"}}/>
        <button onClick={importaDaTesto} disabled={importando||!testo.trim()}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
          style={{background:"#f3e8ff",color:"#7c3aed"}}>
          {importando
            ? <><span className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin"/>Estrazione in corso…</>
            : <><IcoDownload size={15}/>Estrai eventi da questo testo</>}
        </button>
        {importMsg && <p className="text-xs px-3 py-2 rounded-xl" style={{background:"#f0fdf4",color:"#166534"}}>{importMsg}</p>}

        {/* Istruzioni Facebook */}
        <div className="rounded-2xl p-4" style={{background:"#e7f3ff",border:"1px solid #bfdbfe"}}>
          <p className="text-[11px] font-black mb-2" style={{color:"#1e40af"}}>Come importare da Facebook</p>
          <ol className="text-xs space-y-1" style={{color:"#1e3a8a"}}>
            <li>1. Vai sulla pagina Facebook della Pro Loco / Comune</li>
            <li>2. Apri un post di evento → copia tutto il testo</li>
            <li>3. Incolla qui sopra → clicca &quot;Estrai eventi&quot;</li>
            <li>4. L&apos;AI estrae titolo, data, luogo e salva l&apos;evento</li>
          </ol>
          <p className="text-[10px] mt-2" style={{color:"#3b82f6"}}>
            💡 Pro Loco da seguire: Pro Loco Teggiano, Pro Loco Sala Consilina, Pro Loco Padula, Pro Loco Sassano, Pro Loco Atena Lucana, Comune di Polla
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell principale
// ─────────────────────────────────────────────────────────────────────────────
export default function PaginaAdmin() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState<Tab>("crea");
  const [rk, setRk] = useState(0);
  const [badge, setBadge] = useState(0);

  useEffect(()=>{
    if(!getUtente()){ router.replace("/registrati"); return; }
    setAuth(true);
    fetch("/api/proposte").then(r=>r.json()).then((l:Proposta[])=>
      setBadge(l.filter(p=>p.stato==="in_attesa").length)
    ).catch(()=>{});
  },[router,rk]);

  if (!auth) return null;

  const TABS:{id:Tab;label:string;badge?:number}[] = [
    {id:"crea",     label:"✏️ Crea"},
    {id:"proposte", label:"📬 Proposte", badge},
    {id:"archivio", label:"🗂️ Archivio"},
    {id:"cron",     label:"🤖 AI"},
  ];

  return (
    <main className="flex-1 pb-24" style={{background:"#f5f3ef"}}>
      {/* Header */}
      <div className="px-4 pt-8 pb-5 max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold mb-5 transition-opacity hover:opacity-70" style={{color:"#16a34a"}}>
          <IcoArrowLeft size={14}/> Home
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{background:"linear-gradient(135deg,#1a3529,#14532d)"}}>
            <IcoSend size={20} style={{color:"#a3e635"}}/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900">Gestione eventi</h1>
            <p className="text-sm" style={{color:"#78716c"}}>Crea · Approva · Pubblica</p>
          </div>
        </div>
      </div>

      {/* Tab bar sticky */}
      <div className="sticky top-0 z-20 px-4 pb-3 pt-1" style={{background:"#f5f3ef"}}>
        <div className="max-w-3xl mx-auto flex gap-1 p-1 rounded-2xl" style={{background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
          {TABS.map(({id,label,badge:b})=>(
            <button key={id} onClick={()=>setTab(id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all relative"
              style={tab===id?{background:"#1a3529",color:"#a3e635"}:{background:"transparent",color:"#78716c"}}>
              {label}
              {b&&b>0?<span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{background:"#dc2626",color:"white"}}>{b>9?"9+":b}</span>:null}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-4">
        {tab==="crea"     && <TabCrea onSuccess={()=>setRk(k=>k+1)}/>}
        {tab==="proposte" && <TabProposte refreshKey={rk}/>}
        {tab==="archivio" && <TabArchivio refreshKey={rk}/>}
        {tab==="cron"     && <TabCron/>}
      </div>
    </main>
  );
}
