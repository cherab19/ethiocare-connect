import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart,
  Calendar,
  Shield,
  Syringe,
  Globe,
  Activity,
  ArrowRight,
  Users,
  Building2,
  CheckCircle2,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { t, language } = useLanguage();

  const features = [
    { icon: Heart, title: t.landing.featureRecords, desc: t.landing.featureRecordsDesc, delay: "0" },
    { icon: Calendar, title: t.landing.featureAppointments, desc: t.landing.featureAppointmentsDesc, delay: "100" },
    { icon: Syringe, title: t.landing.featureVaccinations, desc: t.landing.featureVaccinationsDesc, delay: "200" },
    { icon: Shield, title: t.landing.featureEmergency, desc: t.landing.featureEmergencyDesc, delay: "300" },
    { icon: Globe, title: t.landing.featureBilingual, desc: t.landing.featureBilingualDesc, delay: "400" },
    { icon: Activity, title: t.landing.featureSync, desc: t.landing.featureSyncDesc, delay: "500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">{t.common.appName}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost" size="sm">{t.common.login}</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">{t.common.signup}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="gradient-hero">
          <div className="container mx-auto grid min-h-[85vh] items-center gap-12 px-4 py-20 lg:grid-cols-2">
            <div className="z-10 space-y-8">
              <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                {t.landing.heroTitle}
              </h1>
              <p className="max-w-lg text-lg text-primary-foreground/80">
                {t.landing.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gradient-gold text-accent-foreground shadow-gold hover:opacity-90 gap-2">
                    {t.landing.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    {t.landing.ctaSecondary}
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-2xl shadow-2xl animate-float">
                <img src={heroImage} alt="Ethiopian family healthcare" className="w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full fill-background">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t.landing.features}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t.landing.featuresSubtitle}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group gradient-card rounded-xl border border-border p-6 shadow-warm transition-all hover:-translate-y-1 hover:shadow-gold"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-emerald-muted p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Families / For Hospitals */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-warm">
            <div className="mb-4 inline-flex rounded-lg bg-emerald-muted p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground">{t.landing.forFamilies}</h3>
            <p className="mb-6 text-muted-foreground">{t.landing.forFamiliesDesc}</p>
            <ul className="space-y-2">
              {[t.landing.featureRecords, t.landing.featureVaccinations, t.landing.featureEmergency].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-warm">
            <div className="mb-4 inline-flex rounded-lg bg-emerald-muted p-3">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-foreground">{t.landing.forHospitals}</h3>
            <p className="mb-6 text-muted-foreground">{t.landing.forHospitalsDesc}</p>
            <ul className="space-y-2">
              {[t.landing.featureAppointments, t.landing.featureSync, t.landing.featureRecords].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground">
            {language === "am" ? "ዋጋዎችን ይመልከቱ" : "View Our Plans"}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            {language === "am" ? "ለቤተሰብዎ ጤና አስተዳደር ትክክለኛውን ዕቅድ ይምረጡ" : "Choose the right plan for your family's healthcare management"}
          </p>
          <Link to="/pricing">
            <Button size="lg" className="gradient-gold text-accent-foreground shadow-gold hover:opacity-90">
              {language === "am" ? "ዋጋ" : "View Pricing"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">{t.common.appName}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t.common.tagline}</p>
          <p className="text-xs text-muted-foreground">© 2026 EthioCare Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
