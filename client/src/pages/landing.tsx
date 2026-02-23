import { Link } from "wouter";
import { SiTiktok, SiWhatsapp } from "react-icons/si";
import { Play, Sparkles, Heart, Crown, Monitor } from "lucide-react";

const WHATSAPP_NUMBER = "8293519324";
const TIKTOK_HANDLE = "cartas.eventos";

const templates = [
  {
    id: "clasico",
    name: "Clásico",
    description: "Elegancia atemporal con cortinas doradas y tipografía serif refinada.",
    icon: <Crown className="w-7 h-7" />,
    previewPath: "/invitation?preview=clasico",
    bg: "from-[#1B2A4A] to-[#2D3F6B]",
    accent: "#C9A96E",
    accentBg: "bg-[#C9A96E]",
    textAccent: "text-[#C9A96E]",
    borderAccent: "border-[#C9A96E]",
    badge: "Más popular",
    badgeColor: "bg-[#C9A96E] text-[#1B2A4A]",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#C9A96E]/30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2A4A] to-[#0D1B38] flex flex-col items-center justify-center p-2 gap-1">
          <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/50 flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div className="h-1 w-10 bg-[#C9A96E]/60 rounded mt-1" />
          <div className="h-0.5 w-8 bg-[#C9A96E]/40 rounded" />
          <div className="h-0.5 w-6 bg-[#C9A96E]/30 rounded" />
          <div className="h-px w-12 bg-[#C9A96E]/20 mt-2" />
          <div className="h-0.5 w-10 bg-[#C9A96E]/20 rounded mt-1" />
          <div className="h-0.5 w-8 bg-[#C9A96E]/20 rounded" />
          <div className="h-5 w-14 rounded bg-[#C9A96E] mt-2 opacity-80" />
        </div>
      </div>
    ),
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Intro cinematográfico estilo Netflix con la icónica animación de la N.",
    icon: <Play className="w-7 h-7" />,
    previewPath: "/invitation?preview=netflix",
    bg: "from-[#1a0000] to-[#141414]",
    accent: "#E50914",
    accentBg: "bg-[#E50914]",
    textAccent: "text-[#E50914]",
    borderAccent: "border-[#E50914]",
    badge: "Cinematográfico",
    badgeColor: "bg-[#E50914] text-white",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#E50914]/30">
        <div className="absolute inset-0 bg-[#141414] flex flex-col items-center justify-center p-2 gap-2">
          <div className="font-black text-[#E50914] text-3xl leading-none tracking-tighter">N</div>
          <div className="h-0.5 w-14 bg-[#E50914] rounded mt-1" />
          <div className="h-1 w-10 bg-white/20 rounded" />
          <div className="h-0.5 w-8 bg-white/15 rounded" />
          <div className="h-0.5 w-12 bg-white/10 rounded" />
          <div className="grid grid-cols-2 gap-1 mt-2 w-full px-2">
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded" />
          </div>
          <div className="h-5 w-14 rounded bg-[#E50914] mt-1 opacity-90" />
        </div>
      </div>
    ),
  },
  {
    id: "nineties",
    name: "90s",
    description: "Intro de salvapantallas retro con tostadoras voladoras estilo Windows 95.",
    icon: <Monitor className="w-7 h-7" />,
    previewPath: "/invitation?preview=nineties",
    bg: "from-[#000060] to-[#008080]",
    accent: "#00FFFF",
    accentBg: "bg-[#00FFFF]",
    textAccent: "text-[#00FFFF]",
    borderAccent: "border-[#00FFFF]",
    badge: "Retro",
    badgeColor: "bg-[#00FFFF] text-black",
    mockup: (
      <div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-[#00FFFF]/30">
        <div className="absolute inset-0 bg-[#008080] flex flex-col items-start justify-start p-1.5 gap-1">
          <div className="w-full bg-[#000080] text-white text-[6px] px-1 py-0.5 flex items-center gap-1 rounded-t">
            <div className="w-2 h-2 bg-[#C0C0C0] rounded-sm text-[4px] text-black flex items-center justify-center font-bold">W</div>
            <span className="font-mono">Invitacion.exe</span>
          </div>
          <div className="w-full bg-[#C0C0C0] flex-1 rounded-b p-1 flex flex-col gap-1 border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]">
            <div className="h-1 w-12 bg-[#000080] rounded" />
            <div className="h-0.5 w-10 bg-[#404040] rounded" />
            <div className="h-0.5 w-8 bg-[#404040] rounded" />
            <div className="h-0.5 w-10 bg-[#404040] rounded" />
            <div className="h-3 w-full bg-[#000080] mt-1 rounded flex items-center justify-center">
              <span className="text-white text-[5px] font-mono">CONFIRMAR</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Quiero%20una%20invitaci%C3%B3n%20digital%20para%20mi%20boda`;

  return (
    <div className="min-h-screen bg-[#080D1A] text-white">
      <header className="sticky top-0 z-50 bg-[#080D1A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1B2A4A] border border-[#C9A96E]/40 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-5 h-5" fill="none">
                <path d="M4 10C4 9.17 4.67 8.5 5.5 8.5H30.5C31.33 8.5 32 9.17 32 10V26C32 26.83 31.33 27.5 30.5 27.5H5.5C4.67 27.5 4 26.83 4 26V10Z" stroke="#C9A96E" strokeWidth="1.5"/>
                <path d="M4 10L18 20L32 10" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4 26L13 19" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                <path d="M32 26L23 19" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Cartas y Eventos</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-header"
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1db955] text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <SiWhatsapp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solicitar</span>
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C9A96E]/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-full px-4 py-1.5 text-[#C9A96E] text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Invitaciones digitales únicas
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5"
            data-testid="text-hero-title"
          >
            Tu boda,{" "}
            <span className="text-[#C9A96E]">una experiencia</span>
            <br />que nunca olvidarán
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Invitaciones digitales con animaciones únicas, seguimiento de confirmaciones y tres estilos
            exclusivos para el día más especial de tu vida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-hero"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1db955] text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20"
            >
              <SiWhatsapp className="w-5 h-5" />
              Solicitar por WhatsApp
            </a>
            <a
              href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-tiktok-hero"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
            >
              <SiTiktok className="w-4 h-4" />
              @{TIKTOK_HANDLE}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" id="plantillas">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" data-testid="text-templates-title">
              Elige tu <span className="text-[#C9A96E]">estilo</span>
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
              Tres experiencias distintas para sorprender a tus invitados desde el primer momento.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
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
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{t.description}</p>
                  <Link
                    href={t.previewPath}
                    data-testid={`link-preview-${t.id}`}
                    className={`w-full flex items-center justify-center gap-1.5 border ${t.borderAccent} ${t.textAccent} hover:bg-white/5 text-sm font-medium px-4 py-2 rounded-lg transition-colors`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Ver demo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">¿Cómo <span className="text-[#C9A96E]">funciona</span>?</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">Sencillo, rápido y totalmente personalizado.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Escríbenos", desc: "Contáctanos por WhatsApp o TikTok con los datos de tu boda." },
              { step: "02", title: "Personalizamos", desc: "Elegimos el estilo juntos y configuramos tu invitación con toda la información." },
              { step: "03", title: "Comparte", desc: "Recibes un enlace único por invitado para compartir por cualquier red social." },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10" data-testid={`card-step-${item.step}`}>
                <div className="text-5xl font-black text-[#C9A96E]/15 mb-3">{item.step}</div>
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-[#1B2A4A] to-[#0D1B38] border border-[#C9A96E]/20 p-8 md:p-12 text-center">
            <Heart className="w-10 h-10 text-[#C9A96E] mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">¿Lista para tu invitación?</h2>
            <p className="text-white/60 mb-7 max-w-lg mx-auto">
              Contáctanos hoy y haremos que tus invitados vivan una experiencia única antes de llegar a tu boda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-cta"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1db955] text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#25D366]/25"
              >
                <SiWhatsapp className="w-5 h-5" />
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
              <a
                href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-tiktok-cta"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105"
              >
                <SiTiktok className="w-4 h-4" />
                @{TIKTOK_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1B2A4A] border border-[#C9A96E]/30 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-[#C9A96E]" />
            </div>
            <span>Cartas y Eventos</span>
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
