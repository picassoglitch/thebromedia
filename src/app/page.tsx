import { readFileSync } from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import HeroV2 from "@/components/HeroV2";
import Ticker from "@/components/Ticker";
import About from "@/components/About";
import Experiences from "@/components/Experiences";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionSidebar from "@/components/fx/SectionSidebar";
import type { SiteContent } from "@/types/content";

function getContent(): SiteContent {
  const filePath = path.join(process.cwd(), "content", "site.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export default function Home() {
  const content = getContent();
  return (
    <main className="min-h-screen">
      <Navbar nav={content.nav} logoImage={content.hero.logoImage} />
      <SectionSidebar
        sections={[
          { id: "hero", label: "Inicio" },
          { id: "nosotros", label: "Nosotros" },
          { id: "experiencias", label: "Experiencias" },
          { id: "logros", label: "Logros" },
          { id: "servicios", label: "Servicios" },
          { id: "bros", label: "Bro's" },
          { id: "contacto", label: "Contacto" },
        ]}
      />
      <HeroV2 hero={content.hero} />
      <Ticker items={content.ticker} />
      <About about={content.about} video={content.video} />
      <Experiences experiences={content.experiences} />
      <Stats stats={content.stats} />
      <Services services={content.services} />
      <Partners partners={content.partners} />
      <Contact contact={content.contact} />
      <Footer footer={content.footer} />
    </main>
  );
}
