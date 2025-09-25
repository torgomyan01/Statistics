export const SITE_URL = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  FORGOT_PASSWORD_CHECK: "/auth/forgot-password/check",
  VERIFY_USER: "/auth/verify-user",
  ACCOUNT: "/account",
  OFFER: "/offer",
  SEARCH: "/search",
  PROPOSAL: "/proposal",
  PROPOSAL_: "/proposal/create",
  ACCOUNT_REVIEWS: "/account/reviews",
  ACCOUNT_FAVORITES: "/account/favorites",
  ACCOUNT_TRANSACTIONS: "/account/transactions",
  ACCOUNT_SUGGESTIONS: "/account/offers",
  ACCOUNT_OFFER_CREATE: "/account/offers/create",
  ACCOUNT_TARIFFS_BONUSES: "/account/tariffs-bonuses",

  CHAT: "/im",

  COMPANY_CREATE: "/company/create",
  COMPANY_THANKS: "/company/thanks",
  COMPANY: (id: number | string) => `/company/${id}`,
  COMPANY_OFFERS: (id: number | string) => `/company/${id}/offers`,
  COMPANY_REVIEWS: (id: number | string) => `/company/${id}/reviews`,
};

export const fileHost = "https://2410924f2b33.hosting.myjino.ru/";
export const fileHostUpload =
  "https://2410924f2b33.hosting.myjino.ru/save-images.php";
export const fileHostUploadDoc =
  "https://2410924f2b33.hosting.myjino.ru/upload-doc-file.php";
export const fileHostRemove =
  "https://2410924f2b33.hosting.myjino.ru/remove-image.php";

export const localStorageKeys = {
  tokenData: "tokenData",
  tokenTime: "tokenTime",
  tokenAdmin: "tokenAdmin",
  userAdmin: "userAdmin",
  languages: "languages",
  cookieComplete: "cookieComplete",
};

export const motionOptionText = {
  init: {
    opacity: 0,
    y: "30px",
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};
