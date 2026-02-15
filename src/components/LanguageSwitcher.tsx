import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === "en" ? "am" : "en")}
        className="gap-1.5 text-sm"
      >
        <Globe className="h-4 w-4" />
        {language === "en" ? t.common.amharic : t.common.english}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("am")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          language === "am"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        አማ
      </button>
    </div>
  );
}
