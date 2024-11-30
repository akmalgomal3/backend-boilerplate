import * as useragent from 'useragent';

export const GetUserDeviceType = async function(req: Request): Promise<string>{
    try {
        const userAgent = req.headers['user-agent'];
        const agent = useragent.parse(userAgent);
        let deviceType = "desktop";

        if (agent.device.family === 'iPad' || agent.device.family === 'Playbook' || /mobile|iphone|ipod|android|blackberry|iemobile|kindle|silk-accelerated|hpwos|webos|opera mini/i.test(userAgent)) {
            deviceType = "mobile";
        }

        return deviceType
    } catch (e) {
        throw e
    }
}