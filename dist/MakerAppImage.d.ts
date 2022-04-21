import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import type { ForgePlatform } from '@electron-forge/shared-types';
import type { AppImageOptions } from 'app-builder-lib';
export default class MakerAppImage extends MakerBase<AppImageOptions> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ appName, dir, forgeConfig, makeDir, targetArch, // 'x64'
    packageJSON }: MakerOptions): Promise<string[]>;
}
