import { withDangerousMod, ConfigPlugin } from '@expo/config-plugins';
import fs from 'node:fs';
import path from 'node:path';

const withFlexatarAssets: ConfigPlugin = (config) => withDangerousMod(config, ['android', async (cfg) => {
  const projectRoot = cfg.modRequest.projectRoot;
  const source = path.join(projectRoot, 'files');
  const target = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets', 'flexatar');
  if (!fs.existsSync(source)) return cfg;
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });
  return cfg;
}]);

export default withFlexatarAssets;
