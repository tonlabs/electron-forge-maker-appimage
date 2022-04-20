import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import { AppImageOptions } from 'app-builder-lib';
export default class MakerAppImage extends MakerBase<AppImageOptions> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make(options: MakerOptions): Promise<string[]>;
}
