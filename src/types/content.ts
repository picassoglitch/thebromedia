export interface NavLink {
  label: string;
  href: string;
}

export interface NavContent {
  logo: string;
  links: NavLink[];
  cta: string;
}

export interface HeroContent {
  tagline: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  bgImage?: string;
  logoImage?: string;
}

export interface AboutContent {
  label: string;
  title: string;
  body: string;
  image: string;
}

export interface ExperienceItem {
  icon: string;
  title: string;
  description: string;
}

export interface ExperiencesContent {
  label: string;
  title: string;
  items: ExperienceItem[];
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface ServicesContent {
  label: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export interface StatItem {
  value: string;
  unit: string;
  label: string;
}

export interface StatsContent {
  label: string;
  title: string;
  items: StatItem[];
}

export interface PartnerLogo {
  name: string;
  image: string;
}

export interface PartnersContent {
  label: string;
  title: string;
  subtitle: string;
  logos: PartnerLogo[];
}

export interface ContactContent {
  label: string;
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  facebook: string;
  facebookUrl: string;
}

export interface VideoContent {
  label: string;
  title: string;
  subtitle?: string;
  url: string;
  poster?: string;
}

export interface FooterContent {
  copy: string;
}

export interface SiteContent {
  nav: NavContent;
  hero: HeroContent;
  ticker: string[];
  about: AboutContent;
  experiences: ExperiencesContent;
  services: ServicesContent;
  stats: StatsContent;
  video: VideoContent;
  partners: PartnersContent;
  contact: ContactContent;
  footer: FooterContent;
}
