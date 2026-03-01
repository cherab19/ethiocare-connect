import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Heart, Check, Crown, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const plans = [
  {
    key: "free",
    name: "Free",
    nameAm: "ነጻ",
    price: 0,
    currency: "ETB",
    features: [
      { en: "Up to 3 family members", am: "እስከ 3 የቤተሰብ አባላት" },
      { en: "Basic health records", am: "መሰረታዊ የጤና መዝገቦች" },
      { en: "Vaccination tracking", am: "የክትባት ክትትል" },
      { en: "Emergency health card", am: "የአደጋ ጊዜ ካርድ" },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    nameAm: "ፕሪሚየም",
    price: 299,
    currency: "ETB",
    period: "/month",
    periodAm: "/ወር",
    popular: true,
    features: [
      { en: "Unlimited family members", am: "ያልተገደበ የቤተሰብ አባላት" },
      { en: "Full medical records", am: "ሙሉ የህክምና መዝገቦች" },
      { en: "Appointment booking", am: "የቀጠሮ ቦታ ማስያዝ" },
      { en: "Hospital sync", am: "የሆስፒታል ሲንክ" },
      { en: "Priority support", am: "ቅድሚያ ድጋፍ" },
      { en: "Real-time notifications", am: "የቅጽበት ማሳወቂያዎች" },
    ],
  },
];

export default function PricingPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isActive, initCheckout } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }
    if (plan.price === 0) {
      navigate("/family/dashboard");
      return;
    }
    setLoading(plan.key);
    try {
      const { checkout_url } = await initCheckout(plan.key, plan.price, window.location.origin + "/family/dashboard");
      window.location.href = checkout_url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const isAm = language === "am";

  return (
    <div className="min-h-screen bg-background">
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
            {user ? (
              <Link to="/family/dashboard">
                <Button size="sm">{t.common.dashboard}</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm">{t.common.login}</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-foreground">
              {isAm ? "ዋጋ" : "Simple, Transparent Pricing"}
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              {isAm
                ? "ለቤተሰብዎ ጤና የሚስማማውን ዕቅድ ይምረጡ"
                : "Choose the plan that fits your family's healthcare needs"}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-8 shadow-warm transition-all hover:-translate-y-1 ${
                  plan.popular
                    ? "border-accent bg-card shadow-gold"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full gradient-gold px-4 py-1 text-xs font-semibold text-accent-foreground">
                      <Crown className="h-3 w-3" />
                      {isAm ? "ተወዳጅ" : "Most Popular"}
                    </span>
                  </div>
                )}

                <h3 className="mb-2 font-display text-2xl font-bold text-foreground">
                  {isAm ? plan.nameAm : plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price === 0 ? (isAm ? "ነጻ" : "Free") : `${plan.price} ${plan.currency}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{isAm ? plan.periodAm : plan.period}</span>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      {isAm ? f.am : f.en}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.key || (isActive && plan.key === "premium")}
                  className={`w-full ${plan.popular ? "gradient-gold text-accent-foreground hover:opacity-90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isActive && plan.key === "premium"
                    ? (isAm ? "ንቁ" : "Active")
                    : plan.price === 0
                    ? (isAm ? "ጀምር" : "Get Started")
                    : (isAm ? "አሁን ይግዙ" : "Subscribe Now")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
