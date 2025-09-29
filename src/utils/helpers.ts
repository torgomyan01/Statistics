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

export const scoreToColor = (score: number) => {
  if (score) {
    score = Math.max(0, Math.min(100, score));

    let r,
      g,
      b = 0;

    if (score <= 50) {
      g = Math.round(255 * (score / 50));
      r = 255;
    } else {
      g = 255;
      r = Math.round(255 * (1 - (score - 50) / 50));
    }

    const toHex = (c: any) => {
      const hex = c.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } else {
    return "#0000";
  }
};
