import { Link } from "wouter";
import { SiTiktok, SiWhatsapp } from "react-icons/si";
import { Play, Sparkles, Heart, Crown, Monitor, Palette, Pencil, ImageIcon, Music } from "lucide-react";

const GOLD = "#C9A84C";
const WHATSAPP_NUMBER = "8293519324";
const TIKTOK_HANDLE = "cartas.eventos";

const templates = [
  {
    id: "clasico",
    name: "Clásico Elegante",
    description: "Cortinas doradas con apertura cinematográfica, tipografía serif refinada y paletas de color personalizables.",
    icon: <Crown className="w-7 h-7" />,
    previewPath: "/invitation?preview=clasico",
    bg: "from-[#EDE5D8] to-[#FDF8F0]",
    accent: "#800020",
    badgeColor: "bg-[#800020] text-white",
    badge: "Más popular",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#C9A96E]/40">
        {/* Cream/parchment bg — matches the real classic invitation */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-3 px-2 pb-2 gap-1" style={{ background: "#FDF8F0" }}>
          {/* Circular couple photo placeholder */}
          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mb-0.5 overflow-hidden" style={{ borderColor: "#C9A96E80", background: "#F5EDE0" }}>
            <Heart className="w-4 h-4" style={{ color: "#800020", fill: "#80002040" }} />
          </div>
          {/* Couple name lines */}
          <div className="h-1.5 w-14 rounded" style={{ background: "#80002090" }} />
          {/* & symbol */}
          <div className="text-[8px] font-serif" style={{ color: "#C9A96E" }}>&</div>
          <div className="h-1.5 w-12 rounded" style={{ background: "#80002070" }} />
          {/* Gold divider */}
          <div className="flex items-center gap-1 w-full mt-1">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #C9A96E)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "#C9A96E" }} />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #C9A96E)" }} />
          </div>
          {/* Date */}
          <div className="h-1 w-16 rounded mt-0.5" style={{ background: "#5C403360" }} />
          {/* Detail lines */}
          <div className="h-0.5 w-12 rounded" style={{ background: "#5C403330" }} />
          <div className="h-0.5 w-14 rounded" style={{ background: "#5C403330" }} />
          <div className="h-0.5 w-10 rounded" style={{ background: "#5C403325" }} />
          {/* RSVP button */}
          <div className="h-4 w-16 rounded mt-1 flex items-center justify-center" style={{ background: "#800020", boxShadow: "0 1px 4px #80002040" }}>
            <span className="text-[5px] tracking-wider text-white font-medium">CONFIRMAR</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Intro cinematográfica con la animación de la letra N, estética de serie premium y confirmación de asistencia en pantalla.",
    icon: <Play className="w-7 h-7" />,
    previewPath: "/invitation?preview=netflix",
    bg: "from-[#1a0000] to-[#0a0000]",
    accent: "#E50914",
    badgeColor: "bg-[#E50914] text-white",
    badge: "Cinematográfico",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#E50914]/30">
        <div className="absolute inset-0 bg-[#0a0000] flex flex-col items-center justify-center p-2 gap-2">
          <div className="font-black text-[#E50914] text-3xl leading-none tracking-tighter">N</div>
          <div className="h-0.5 w-14 bg-[#E50914] rounded mt-1" />
          <div className="h-1 w-10 bg-white/20 rounded" />
          <div className="h-0.5 w-8 bg-white/15 rounded" />
          <div className="h-0.5 w-12 bg-white/10 rounded" />
          <div className="grid grid-cols-2 gap-1 mt-2 w-full px-2">
            <div className="h-8 rounded bg-white/10" />
            <div className="h-8 rounded bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "nineties",
    name: "Años 90",
    description: "Intro estilo TV vintage de los 90 con efecto VCR, tostadoras voladoras y estética de telenovela con colores dorados.",
    icon: <Monitor className="w-7 h-7" />,
    previewPath: "/invitation?preview=nineties",
    bg: "from-[#1A0E00] to-[#080500]",
    accent: GOLD,
    badgeColor: "bg-[#C9A84C] text-black",
    badge: "Vintage",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#C9A84C]/30">
        <div className="absolute inset-0 bg-[#080500] flex flex-col items-center justify-center p-2 gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="text-[#C9A84C] text-[7px] font-serif italic font-bold text-center leading-tight">Sofía &amp; Daniel</div>
          <div className="text-[7px] tracking-widest" style={{ color: `${GOLD}80` }}>✦ su boda ✦</div>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="h-1 w-10 rounded mt-1" style={{ background: `${GOLD}20` }} />
          <div className="h-0.5 w-8 rounded" style={{ background: `${GOLD}20` }} />
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mt-1" />
          <div className="h-4 w-14 rounded mt-1 flex items-center justify-center" style={{ border: `1px solid ${GOLD}80` }}>
            <span className="text-[5px] tracking-wider" style={{ color: GOLD }}>CONFIRMAR</span>
          </div>
        </div>
      </div>
    ),
  },
];

const personalizations = [
  { icon: <Pencil className="w-5 h-5" />, title: "Nombres y mensajes", desc: "Tu historia, tus palabras. Personaliza cada texto de la invitación." },
  { icon: <ImageIcon className="w-5 h-5" />, title: "Foto de pareja", desc: "Sube su foto favorita y aparecerá en la invitación de forma destacada." },
  { icon: <Palette className="w-5 h-5" />, title: "Colores y estilos", desc: "Elige entre múltiples paletas de colores o solicita una totalmente a tu gusto." },
  { icon: <Music className="w-5 h-5" />, title: "Video introductorio", desc: "Agrega un video de YouTube o sube tu propio MP4 como intro antes de la invitación." },
];

export default function LandingPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Quiero%20una%20invitaci%C3%B3n%20digital%20personalizada%20para%20mi%20boda`;

  return (
    <div className="min-h-screen text-white" style={{ background: "#000000" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(0,0,0,0.92)", borderColor: `${GOLD}18` }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Cartas y Eventos"
              className="w-10 h-10 object-contain"
            />
            <div className="leading-tight">
              <div className="font-bold text-sm tracking-wide text-white">Cartas y Eventos</div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: `${GOLD}80` }}>Invitaciones Digitales</div>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-tiktok-header"
              className="hidden sm:flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: `${GOLD}80` }}
            >
              <SiTiktok className="w-3.5 h-3.5" />
              @{TIKTOK_HANDLE}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-header"
              className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ background: "#25D366" }}
            >
              <SiWhatsapp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solicitar</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-[120px]" style={{ background: `${GOLD}08` }} />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full blur-[100px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Logo destacado */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${GOLD}15` }} />
              <img
                src="/logo.png"
                alt="Cartas y Eventos"
                className="relative w-28 h-28 sm:w-36 sm:h-36 object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 border" style={{ background: `${GOLD}10`, borderColor: `${GOLD}25`, color: GOLD }}>
            <Sparkles className="w-3.5 h-3.5" />
            100% personalizadas al gusto de cada pareja
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5"
            data-testid="text-hero-title"
          >
            Tu boda,{" "}
            <span style={{ color: GOLD }}>una experiencia</span>
            <br />que nunca olvidarán
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Invitaciones digitales únicas con animaciones exclusivas, seguimiento de confirmaciones en tiempo real
            y personalización completa — desde los colores hasta el video introductorio.
          </p>
          <p className="text-base max-w-xl mx-auto mb-8 font-medium" style={{ color: `${GOLD}B0` }}>
            Cada invitación es diseñada a medida para reflejar el estilo único de su pareja.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-hero"
              className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg"
              style={{ background: "#25D366", boxShadow: "0 8px 24px rgba(37,211,102,0.2)" }}
            >
              <SiWhatsapp className="w-5 h-5" />
              Solicitar por WhatsApp
            </a>
            <a
              href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-tiktok-hero"
              className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <SiTiktok className="w-4 h-4" />
              @{TIKTOK_HANDLE}
            </a>
          </div>
        </div>
      </section>

      {/* ── Personalization ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-y" style={{ background: "rgba(255,255,255,0.015)", borderColor: `${GOLD}10` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Hecha <span style={{ color: GOLD }}>exactamente</span> como la sueñas
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              No usamos plantillas genéricas. Cada invitación se configura y diseña especialmente para ti.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalizations.map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border transition-colors"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }}
                data-testid={`card-personalization-${i}`}
              >
                <div className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3" style={{ background: `${GOLD}12`, borderColor: `${GOLD}25`, color: GOLD }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4" id="plantillas">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" data-testid="text-templates-title">
              Elige tu <span style={{ color: GOLD }}>estilo base</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Tres experiencias distintas — todas 100% personalizables en colores, contenido, fotos y video.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}
                data-testid={`card-template-${t.id}`}
              >
                <div className={`bg-gradient-to-b ${t.bg} p-8 flex flex-col items-center`}>
                  {t.mockup}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{t.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${t.badgeColor}`}>
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>{t.description}</p>
                  <Link
                    href={t.previewPath}
                    data-testid={`link-preview-${t.id}`}
                    className="w-full flex items-center justify-center gap-1.5 border text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
                    style={{ borderColor: `${t.accent}60`, color: t.accent }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Ver demo
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            ¿Tienes otro estilo en mente? Escríbenos — trabajamos invitaciones completamente a medida.
          </p>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t" style={{ borderColor: `${GOLD}10` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">¿Cómo <span style={{ color: GOLD }}>funciona</span>?</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>Sencillo, rápido y totalmente a tu gusto.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Cuéntanos tu idea", desc: "Escríbenos por WhatsApp o TikTok con los datos de tu boda y cómo te imaginas la invitación." },
              { step: "02", title: "Diseñamos juntos", desc: "Elegimos el estilo, los colores, el video y todos los detalles hasta que quede perfecta para ti." },
              { step: "03", title: "Comparte con tus invitados", desc: "Cada invitado recibe un enlace único con su nombre y asientos. Tú ves las confirmaciones en tiempo real." },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }} data-testid={`card-step-${item.step}`}>
                <div className="text-5xl font-black mb-3" style={{ color: `${GOLD}18` }}>{item.step}</div>
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border p-8 md:p-12 text-center" style={{ background: `linear-gradient(135deg, #0D0800 0%, #1A1000 50%, #0D0800 100%)`, borderColor: `${GOLD}30` }}>
            <img src="/logo.png" alt="" className="w-16 h-16 object-contain mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-3">¿Lista tu invitación soñada?</h2>
            <p className="mb-3 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              Cuéntanos cómo la imaginas y la hacemos realidad.
              Sin plantillas genéricas — solo tu historia, a tu manera.
            </p>
            <p className="text-sm mb-7" style={{ color: `${GOLD}80` }}>
              Disponible 7 días a la semana · Respuesta en menos de 24 horas
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-cta"
                className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg"
                style={{ background: "#25D366", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}
              >
                <SiWhatsapp className="w-5 h-5" />
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
              <a
                href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-tiktok-cta"
                className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 border"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <SiTiktok className="w-4 h-4" />
                @{TIKTOK_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t py-8 px-4" style={{ borderColor: `${GOLD}10` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-6 h-6 object-contain opacity-60" />
            <span>Cartas y Eventos — Invitaciones 100% personalizadas</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-tiktok-footer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <SiTiktok className="w-3.5 h-3.5" />
              @{TIKTOK_HANDLE}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-footer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <SiWhatsapp className="w-3.5 h-3.5" />
              {WHATSAPP_NUMBER}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
