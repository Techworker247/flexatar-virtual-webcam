import { withDangerousMod } from '@expo/config-plugins';
import fs from 'node:fs';
import path from 'node:path';

const withFlexatarAssets = (config) => withDangerousMod(config, ['android', async (cfg) => {
  const projectRoot = cfg.modRequest.projectRoot;
  const source = path.join(projectRoot, 'files');
  const host = path.join(projectRoot, 'assets', 'flexatar', 'renderer-host.html');
  const target = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets', 'flexatar');

  if (!fs.existsSync(source)) {
    throw new Error(`Flexatar engine asset directory is missing: ${source}`);
  }
  if (!fs.existsSync(host)) {
    throw new Error(`Flexatar renderer host is missing: ${host}`);
  }

  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });
  fs.copyFileSync(host, path.join(target, 'renderer-host.html'));
  return cfg;
}]);

export default withFlexatarAssets;
