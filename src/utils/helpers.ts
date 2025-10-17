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

  // Return transparent if no indicators are available
  if (selectedCountryIndicatorHave === 0) {
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

  if (r === 0 && g === 0 && b === 0) {
    return "#0000";
  }

  const { hex } = adjustSaturation([r, g, b], alpha);
  return hex;
};

export function adjustSaturation(rgb: number[], percentFromLeft: number) {
  // rgb: [R, G, B] values (0–255)
  // percentFromLeft: 0–100 (0 = white, 100 = original color)

  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Convert to HSV
  let h;
  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }

  const v = max;

  const newS = percentFromLeft / 100;

  // Convert back to RGB
  const c = newS * v;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1, g1, b1;

  if (h < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (h < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (h < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  const R = Math.round((r1 + m) * 255);
  const G = Math.round((g1 + m) * 255);
  const B = Math.round((b1 + m) * 255);

  // Convert to HEX
  const hex = `#${[R, G, B]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;

  return { rgb: [R, G, B], hex };
}

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
