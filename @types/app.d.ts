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
    allIndicators: IIndicatorData[] | null;
    selectedIndicator: string[];
    selectedCountry: string | null;
    selectedScoreYear: number;
    selectedCountryIso: string | null;
    selectedGroup: string[];
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

declare interface IIndicatorData {
  indicator_code: string;
  indicator_name: string;
  country_count: number;
  group: string;
}
