"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut, Save, CheckCircle, AlertCircle, Home, Menu,
  Type, List, BarChart2, Users, Phone, Globe, Zap, Video
} from "lucide-react";
import type { SiteContent } from "@/types/content";

type Tab = "hero" | "about" | "experiences" | "services" | "stats" | "video" | "partners" | "contact" | "nav";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "nav", label: "Navegación", icon: Globe },
  { id: "hero", label: "Hero", icon: Type },
  { id: "about", label: "Nosotros", icon: Home },
  { id: "experiences", label: "Experiencias", icon: Zap },
  { id: "services", label: "Servicios", icon: List },
  { id: "stats", label: "Estadísticas", icon: BarChart2 },
  { id: "video", label: "Video", icon: Video },
  { id: "partners", label: "Partners", icon: Users },
  { id: "contact", label: "Contacto", icon: Phone },
];

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
        />
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/content");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setContent(data);
  }, [router]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function update(path: string[], value: unknown) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev) as unknown as Record<string, unknown>;
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]] as Record<string, unknown>;
      }
      obj[path[path.length - 1]] = value;
      return next as unknown as SiteContent;
    });
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-brand-accent text-sm animate-pulse uppercase tracking-widest">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark border-r border-brand-border transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-brand-border">
            <div className="text-white font-black text-sm tracking-widest uppercase">
              THE <span className="text-brand-accent">BRO</span> MEDIA
            </div>
            <div className="text-gray-600 text-xs mt-0.5 uppercase tracking-wider">Admin Panel</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 mb-0.5 ${
                    activeTab === tab.id
                      ? "bg-brand-accent/10 text-brand-accent border-l-2 border-brand-accent"
                      : "text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-brand-border space-y-2">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              <Home size={14} />
              Ver sitio
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-brand-dark border-b border-brand-border">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-white font-semibold text-sm uppercase tracking-widest">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-green-400"
              >
                <CheckCircle size={14} />
                Guardado
              </motion.span>
            )}
            {error && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={14} />
                {error}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent text-brand-black text-xs font-bold uppercase tracking-widest hover:bg-brand-accent-dim transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl space-y-6"
          >
            {/* HERO */}
            {activeTab === "hero" && (
              <>
                <SectionHeader title="Sección Hero" description="El bloque principal visible al entrar al sitio." />
                <Field label="Título principal (ej: WE ARE THAT BRO)" value={content.hero.headline} onChange={(v) => update(["hero", "headline"], v)} />
                <Field label="Banda naranja / subtítulo (ej: THAT HAS A BRO FOR EVERYTHING)" value={content.hero.subheadline} onChange={(v) => update(["hero", "subheadline"], v)} />
                <Field label="Texto del botón CTA" value={content.hero.ctaLabel} onChange={(v) => update(["hero", "ctaLabel"], v)} />
                <Field label="Tagline pequeño (encima del logo)" value={content.hero.tagline} onChange={(v) => update(["hero", "tagline"], v)} />
                <div className="border-t border-brand-border pt-4">
                  <p className="text-xs text-gray-500 mb-4">
                    Para reemplazar la foto de fondo o el logo, coloca el archivo en <code className="text-brand-accent">public/images/</code> y escribe la ruta aquí.
                  </p>
                  <Field
                    label="Foto de fondo del hero (ej: /images/hero-bg.jpg)"
                    value={content.hero.bgImage || ""}
                    onChange={(v) => update(["hero", "bgImage"], v)}
                  />
                  <div className="mt-4">
                    <Field
                      label="Logo (ej: /images/logo.png)"
                      value={content.hero.logoImage || ""}
                      onChange={(v) => update(["hero", "logoImage"], v)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* NAV */}
            {activeTab === "nav" && (
              <>
                <SectionHeader title="Navegación" description="Logo y enlace del botón principal." />
                <Field label="Texto del logo" value={content.nav.logo} onChange={(v) => update(["nav", "logo"], v)} />
                <Field label="Texto del botón CTA" value={content.nav.cta} onChange={(v) => update(["nav", "cta"], v)} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    Ticker (palabras separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={content.ticker.join(", ")}
                    onChange={(e) =>
                      update(["ticker"], e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                    }
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Tech, Media, Marketing, AI..."
                  />
                </div>
              </>
            )}

            {/* ABOUT */}
            {activeTab === "about" && (
              <>
                <SectionHeader title="Sección Nosotros" description="Información sobre la empresa." />
                <Field label="Etiqueta" value={content.about.label} onChange={(v) => update(["about", "label"], v)} />
                <Field label="Título" value={content.about.title} onChange={(v) => update(["about", "title"], v)} />
                <Field label="Texto" value={content.about.body} onChange={(v) => update(["about", "body"], v)} multiline />
              </>
            )}

            {/* SERVICES */}
            {activeTab === "services" && (
              <>
                <SectionHeader title="Servicios" description="Editar los servicios que ofrece la empresa." />
                <Field label="Etiqueta" value={content.services.label} onChange={(v) => update(["services", "label"], v)} />
                <Field label="Título de sección" value={content.services.title} onChange={(v) => update(["services", "title"], v)} />
                <Field label="Subtítulo" value={content.services.subtitle} onChange={(v) => update(["services", "subtitle"], v)} multiline />

                <div className="border-t border-brand-border pt-6">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Servicios individuales</div>
                  {content.services.items.map((item, i) => (
                    <div key={i} className="border border-brand-border bg-brand-card p-5 mb-4">
                      <div className="text-xs text-brand-accent uppercase tracking-widest mb-3">Servicio {i + 1}</div>
                      <div className="space-y-3">
                        <Field label="Título" value={item.title} onChange={(v) => {
                          const items = [...content.services.items];
                          items[i] = { ...items[i], title: v };
                          update(["services", "items"], items);
                        }} />
                        <Field label="Descripción" value={item.description} onChange={(v) => {
                          const items = [...content.services.items];
                          items[i] = { ...items[i], description: v };
                          update(["services", "items"], items);
                        }} multiline />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* EXPERIENCES */}
            {activeTab === "experiences" && (
              <>
                <SectionHeader title="Experiencias" description="Las tres experiencias principales de la empresa." />
                <Field label="Etiqueta" value={content.experiences.label} onChange={(v) => update(["experiences", "label"], v)} />
                <Field label="Título" value={content.experiences.title} onChange={(v) => update(["experiences", "title"], v)} />
                {content.experiences.items.map((item, i) => (
                  <div key={i} className="border border-brand-border bg-brand-card p-5 mb-4">
                    <div className="text-xs text-brand-accent uppercase tracking-widest mb-3">Experiencia {i + 1}</div>
                    <div className="space-y-3">
                      <Field label="Título" value={item.title} onChange={(v) => {
                        const items = [...content.experiences.items];
                        items[i] = { ...items[i], title: v };
                        update(["experiences", "items"], items);
                      }} />
                      <Field label="Descripción" value={item.description} onChange={(v) => {
                        const items = [...content.experiences.items];
                        items[i] = { ...items[i], description: v };
                        update(["experiences", "items"], items);
                      }} multiline />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* STATS */}
            {activeTab === "stats" && (
              <>
                <SectionHeader title="Estadísticas / Logros" description="Los números que destacan el trabajo de la empresa." />
                <Field label="Etiqueta" value={content.stats.label} onChange={(v) => update(["stats", "label"], v)} />
                <Field label="Título" value={content.stats.title} onChange={(v) => update(["stats", "title"], v)} />
                {content.stats.items.map((item, i) => (
                  <div key={i} className="border border-brand-border bg-brand-card p-5">
                    <div className="text-xs text-brand-accent uppercase tracking-widest mb-3">Estadística {i + 1}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Valor (ej: 15K+)" value={item.value} onChange={(v) => {
                        const items = [...content.stats.items];
                        items[i] = { ...items[i], value: v };
                        update(["stats", "items"], items);
                      }} />
                      <Field label="Unidad (ej: MB)" value={item.unit} onChange={(v) => {
                        const items = [...content.stats.items];
                        items[i] = { ...items[i], unit: v };
                        update(["stats", "items"], items);
                      }} />
                    </div>
                    <div className="mt-3">
                      <Field label="Descripción" value={item.label} onChange={(v) => {
                        const items = [...content.stats.items];
                        items[i] = { ...items[i], label: v };
                        update(["stats", "items"], items);
                      }} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* VIDEO */}
            {activeTab === "video" && (
              <>
                <SectionHeader title="Sección de Video" description="Agrega un video de YouTube o un archivo de video directo." />
                <Field label="Etiqueta" value={content.video.label} onChange={(v) => update(["video", "label"], v)} />
                <Field label="Título" value={content.video.title} onChange={(v) => update(["video", "title"], v)} />
                <Field label="Subtítulo" value={content.video.subtitle ?? ""} onChange={(v) => update(["video", "subtitle"], v)} />
                <Field label="URL del video (YouTube o MP4)" value={content.video.url} onChange={(v) => update(["video", "url"], v)} />
                <Field label="Imagen poster (URL, opcional)" value={content.video.poster ?? ""} onChange={(v) => update(["video", "poster"], v)} />
                <div className="p-4 bg-brand-dark border border-brand-border text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-400">Formatos soportados:</strong><br />
                  · YouTube: https://www.youtube.com/watch?v=ID<br />
                  · Video directo: URL que termine en .mp4, .webm, etc.
                </div>
              </>
            )}

            {/* PARTNERS */}
            {activeTab === "partners" && (
              <>
                <SectionHeader title="Partners / Nuestros Bro's" description="Marcas asociadas." />
                <Field label="Etiqueta" value={content.partners.label} onChange={(v) => update(["partners", "label"], v)} />
                <Field label="Título" value={content.partners.title} onChange={(v) => update(["partners", "title"], v)} />
                <Field label="Subtítulo" value={content.partners.subtitle} onChange={(v) => update(["partners", "subtitle"], v)} />
                {content.partners.logos.map((logo, i) => (
                  <div key={i} className="border border-brand-border bg-brand-card p-4 flex gap-4 items-center">
                    <span className="text-xs text-brand-accent">#{i + 1}</span>
                    <Field label="Nombre del partner" value={logo.name} onChange={(v) => {
                      const logos = [...content.partners.logos];
                      logos[i] = { ...logos[i], name: v };
                      update(["partners", "logos"], logos);
                    }} />
                  </div>
                ))}
                <button
                  onClick={() => update(["partners", "logos"], [...content.partners.logos, { name: "Nuevo Partner", image: "" }])}
                  className="w-full py-3 border border-dashed border-brand-border text-gray-600 text-xs uppercase tracking-widest hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  + Agregar Partner
                </button>
              </>
            )}

            {/* CONTACT */}
            {activeTab === "contact" && (
              <>
                <SectionHeader title="Contacto" description="Información de contacto y redes sociales." />
                <Field label="Etiqueta" value={content.contact.label} onChange={(v) => update(["contact", "label"], v)} />
                <Field label="Título" value={content.contact.title} onChange={(v) => update(["contact", "title"], v)} />
                <Field label="Subtítulo" value={content.contact.subtitle} onChange={(v) => update(["contact", "subtitle"], v)} />
                <Field label="Teléfono" value={content.contact.phone} onChange={(v) => update(["contact", "phone"], v)} />
                <Field label="Email" value={content.contact.email} onChange={(v) => update(["contact", "email"], v)} />
                <Field label="Instagram (handle)" value={content.contact.instagram} onChange={(v) => update(["contact", "instagram"], v)} />
                <Field label="Instagram (URL)" value={content.contact.instagramUrl} onChange={(v) => update(["contact", "instagramUrl"], v)} />
                <Field label="Facebook (nombre)" value={content.contact.facebook} onChange={(v) => update(["contact", "facebook"], v)} />
                <Field label="Facebook (URL)" value={content.contact.facebookUrl} onChange={(v) => update(["contact", "facebookUrl"], v)} />
                <Field label="Texto del footer" value={content.footer.copy} onChange={(v) => update(["footer", "copy"], v)} />
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-4 border-b border-brand-border mb-2">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      <p className="text-gray-600 text-xs mt-1">{description}</p>
    </div>
  );
}
