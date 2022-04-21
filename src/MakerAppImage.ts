import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import type {
    ForgePlatform,
    IForgeMaker,
    IForgeResolvableMaker
} from '@electron-forge/shared-types';
import type { AppImageOptions, FileAssociation } from 'app-builder-lib';
import * as appBuilder from 'app-builder-lib/out/util/appBuilder';
import { mkdirSync, existsSync, rmdirSync } from 'fs';
import path from 'path';

const makerPackageName = 'electron-forge-maker-appimage';

const isIForgeResolvableMaker = (
    maker: IForgeResolvableMaker | IForgeMaker
): maker is IForgeResolvableMaker => {
    return maker.hasOwnProperty('name');
};

type ForgeLinuxOptions = {
    description: string;
    icon: string;
    maintainer: string;
    license: string;
    name: string;
    homepage: string;
    mimeType: string[];
};
export default class MakerAppImage extends MakerBase<AppImageOptions> {
    public name: string = 'AppImage';

    public defaultPlatforms: ForgePlatform[] = ['linux'];

    isSupportedOnCurrentPlatform(): boolean {
        return process.platform === 'linux' || process.platform === 'darwin';
    }

    async make({
        appName,
        dir,
        forgeConfig,
        makeDir,
        targetArch, // 'x64'
        packageJSON
    }: MakerOptions): Promise<string[]> {
        // Check for any optional config data passed in from forge config, specific to this maker
        let config: { options: ForgeLinuxOptions } | undefined;

        const maker = forgeConfig.makers.find(
            (maker) =>
                isIForgeResolvableMaker(maker) &&
                maker.name === makerPackageName
        );

        if (maker !== undefined && isIForgeResolvableMaker(maker)) {
            config = maker.config;
        }

        // Construct the desktop file
        const executableName =
            forgeConfig.packagerConfig.executableName || appName;

        // Build up the desktop meta and entry
        const desktopMeta: { [parameter: string]: string } = {
            Name: appName,
            Exec: `${executableName} %U`,
            Terminal: 'false',
            Type: 'Application',
            Icon: executableName,
            StartupWMClass: packageJSON.productName as string,
            'X-AppImage-Version': packageJSON.version,
            Comment: packageJSON.description,
            Categories: 'Utility'
        };
        if (config?.options?.mimeType?.length) {
            desktopMeta.MimeType = config.options.mimeType.join(';') + ';';
        }

        let desktopEntry = `[Desktop Entry]`;
        for (const name of Object.keys(desktopMeta)) {
            desktopEntry += `\n${name}=${desktopMeta[name]}`;
        }
        desktopEntry += '\n';

        // These icons will be presented in .AppImage file thumbnail
        let icons: { file: string; size: number }[] =
            config?.options?.icon !== undefined
                ? [
                      {
                          file: path.join(dir, '../..', config.options.icon),
                          size: 0
                      }
                  ]
                : [];

        // Create a stage directory
        const stageDir = path.join(makeDir, '__appImage-x64');

        if (!existsSync(makeDir)) {
            mkdirSync(makeDir, { recursive: true });
        }

        if (existsSync(stageDir)) {
            rmdirSync(stageDir);
        }
        mkdirSync(stageDir, { recursive: true });

        // Construct App File name and path
        const appFileName = `${appName}-${packageJSON.version}-${targetArch}.AppImage`;
        const appPath = path.join(makeDir, appFileName);

        const args = [
            'appimage',

            '--stage',
            stageDir,

            '--arch',
            'x64',

            '--output',
            appPath,

            '--app',
            dir,

            '--configuration',
            JSON.stringify({
                productName: appName,
                productFilename: appName,
                desktopEntry,
                executableName,
                icons,
                fileAssociations: []
            })
        ];

        // Make (build) the installer
        await appBuilder.executeAppBuilderAsJson(args);

        // Return the app path
        return [appPath];
    }
}
