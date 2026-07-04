import en from "./en.json";
import lo from "./lo.json";

export const LOCALES = { en, lo };

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "lo", label: "ພາສາລາວ" },
];

/**
 * Resolve a dot-notation key (e.g. "calculators.npv.title") against a locale
 * object, then interpolate any {{placeholder}} tokens with `vars`.
 */
export function translate(lang, key, vars = {}) {
  const dict = LOCALES[lang] || LOCALES.en;
  const raw = key
    .split(".")
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);

  const fallback = key
    .split(".")
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), LOCALES.en);

  let str = raw ?? fallback ?? key;

  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp(`{{${k}}}`, "g"), v);
  });

  return str;
}
