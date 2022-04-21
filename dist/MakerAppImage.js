"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const appBuilder = __importStar(require("app-builder-lib/out/util/appBuilder"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const makerPackageName = 'electron-forge-maker-appimage';
const isIForgeResolvableMaker = (maker) => {
    return maker.hasOwnProperty('name');
};
class MakerAppImage extends maker_base_1.default {
    constructor() {
        super(...arguments);
        this.name = 'AppImage';
        this.defaultPlatforms = ['linux'];
    }
    isSupportedOnCurrentPlatform() {
        return process.platform === 'linux' || process.platform === 'darwin';
    }
    async make({ appName, dir, forgeConfig, makeDir, targetArch, // 'x64'
    packageJSON }) {
        // Check for any optional config data passed in from forge config, specific to this maker
        let config;
        const maker = forgeConfig.makers.find((maker) => isIForgeResolvableMaker(maker) &&
            maker.name === makerPackageName);
        if (maker !== undefined && isIForgeResolvableMaker(maker)) {
            config = maker.config;
        }
        // Construct the desktop file
        const executableName = forgeConfig.packagerConfig.executableName || appName;
        // Build up the desktop meta and entry
        const desktopMeta = {
            Name: appName,
            TryExec: executableName,
            Exec: `${executableName} %U`,
            Terminal: 'false',
            Type: 'Application',
            Icon: executableName,
            StartupWMClass: packageJSON.productName,
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
        let icons = config?.options?.icon !== undefined
            ? [
                {
                    file: path_1.default.join(dir, '../..', config.options.icon),
                    size: 0
                }
            ]
            : [];
        // Create a stage directory
        const stageDir = path_1.default.join(makeDir, '__appImage-x64');
        if (!(0, fs_1.existsSync)(makeDir)) {
            (0, fs_1.mkdirSync)(makeDir, { recursive: true });
        }
        if ((0, fs_1.existsSync)(stageDir)) {
            (0, fs_1.rmdirSync)(stageDir);
        }
        (0, fs_1.mkdirSync)(stageDir, { recursive: true });
        // Construct App File name and path
        const appFileName = `${appName}-${packageJSON.version}-${targetArch}.AppImage`;
        const appPath = path_1.default.join(makeDir, appFileName);
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
exports.default = MakerAppImage;
//# sourceMappingURL=MakerAppImage.js.map