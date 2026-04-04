import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

const supportedLanguages = [
  { code: "en", labelKey: "language.english" },
  { code: "hi", labelKey: "language.hindi" },
  { code: "bn", labelKey: "language.bengali" },
] as const;

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <Languages className="h-3.5 w-3.5" />
      <select
        aria-label={t("settings.language")}
        className="bg-transparent text-xs text-foreground outline-none"
        value={currentLanguage}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {t(language.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
