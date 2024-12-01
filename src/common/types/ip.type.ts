import { DeviceType } from '../enums/user.enum';

export type IpType = {
  'ip-address'?: string;
  'user-agent'?: string;
  'device-type'?: DeviceType;
};

export type IpInfo = {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};
