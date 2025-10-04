declare interface ICountryData {
  id: number;
  Indicator_name: string;
  country_code: string;
  country_name: string;
  indicator_code: string;
  object: any;
}

declare interface IStateSiteInfo {
  siteInfo: {
    allIndicators: ICountryData[] | null;
    selectedIndicator: string[];
    selectedCountry: string | null;
    selectedScoreYear: number;
    selectedCountryIso: string | null;
  };
}

declare interface ICountry {
  id: number;
  iso: string;
  name: string;
  nicename: string;
  iso3: string;
  numcode: number;
  phonecode: number;
}
