const fs = require('fs');
const path = require('path');

// Read version from central config
const versionConfig = JSON.parse(fs.readFileSync('version.json', 'utf8'));

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.version = versionConfig.version;
packageJson.description = versionConfig.description;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.version = versionConfig.version;
manifest.name = versionConfig.name;
manifest.description = versionConfig.description;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Updated version to ${versionConfig.version} in all files`);