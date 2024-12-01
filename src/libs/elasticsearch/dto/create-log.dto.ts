export class CreateLogDto {
  user_id?: string;
  user_role?: 'Executive' | 'Operator' | 'Admin' | '';
  identifier?: string;
  method?: string;
  path?: string;
  log_type?: 'user_auth' | 'user_activity';
  status?: 'success' | 'failed';
  activity?: string;
  timestamp?: number;
  datetime?: Date;
  device_type?: 'mobile' | 'web';
  ip_address?: string;
  user_agent?: string;
  location?: {
    lat: number;
    lon: number;
  };
  country?: string;
  city?: string;
  postal_code?: string;
  timezone?: string;
}
