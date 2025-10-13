export const RandomKey = (length = 5) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

// export const scoreToColor = (score: number) => {
//   if (score) {
//     score = Math.max(0, Math.min(100, score));
//
//     let r,
//       g,
//       b = 0;
//
//     if (score <= 50) {
//       g = Math.round(255 * (score / 50));
//       r = 255;
//     } else {
//       g = 255;
//       r = Math.round(255 * (1 - (score - 50) / 50));
//     }
//
//     const toHex = (c: any) => {
//       const hex = c.toString(16);
//       return hex.length === 1 ? `0${hex}` : hex;
//     };
//
//     return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
//   } else {
//     return "#0000";
//   }
// };

export const scoreToColor = (
  score: number | null | undefined,
  countryAllSelectedIndicators: number,
  selectedCountryIndicatorHave: number,
): string => {
  // Fallback to fully transparent if score is invalid
  if (typeof score !== "number" || isNaN(score)) {
    return "#0000";
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  // Red-to-Green gradient
  let r = 0;
  let g = 0;
  const b = 0;
  if (clampedScore <= 50) {
    r = 255;
    g = Math.round(255 * (clampedScore / 50));
  } else {
    g = 255;
    r = Math.round(255 * (1 - (clampedScore - 50) / 50));
  }

  const alpha =
    (countryAllSelectedIndicators / selectedCountryIndicatorHave) * 100;
  // If RGB would result in black, return transparent instead
  if (r === 255 && g === 0 && b === 0) {
    return "#0000";
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createSlug = (title: string) => {
  if (!title) {
    return "";
  }

  let slug = title.toLowerCase();

  slug = slug.replace(/[^a-z0-9\s-]/g, "");

  slug = slug.replace(/\s+/g, "-");

  slug = slug.replace(/^-+|-+$/g, "");

  slug = slug.replace(/-{2,}/g, "-");

  return slug;
};

export const formatLargeNumber = (number: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(number);

  return formatted !== "NaN" ? formatted : "-";
};

export const truncateText = (
  text: string | null | undefined,
  maxLength = 30,
): string => {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}...`;
};
