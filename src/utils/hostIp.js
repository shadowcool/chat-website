import os from 'os';

export default function getHostIp() {
  const interfaces = os.networkInterfaces();

  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      if (!info.internal && info.family === 'IPv4') {
        return info.address;
      }
    }
  }

  return '127.0.0.1';
}