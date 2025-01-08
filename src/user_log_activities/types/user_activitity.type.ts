export type UserActivity = {
  userId: string;
  username: string;
  activityType: string;
  method: string;
  path: string;
  statusCode: string;
  description: string;
  device: {
    type?: string;
    info: {
      ipAddress: string;
      latitude: Number;
      longitude: Number;
    };
  };
  authDetails: {
    loginTime: Date;
    logoutTime: Date;
  };
};
