const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Read version from central config
const versionConfig = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const releaseNotes = JSON.parse(fs.readFileSync('release-notes.json', 'utf8'));

const version = versionConfig.version;
const appName = versionConfig.name;
const description = versionConfig.description;

const releaseDir = `release/v${version}`;

console.log(`Building ${appName} v${version}...`);

// Clean and create release directory
if (fs.existsSync('release')) {
  fs.rmSync('release', { recursive: true });
}
fs.mkdirSync(releaseDir, { recursive: true });

// Build the extension
execSync('npm run build', { stdio: 'inherit' });

// Copy files to release directory
console.log('Copying files to release directory...');

function copyFolderRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

copyFolderRecursive('dist', releaseDir);

// Create installation instructions
console.log('Creating installation files...');
const installationInstructions = `# Installation Instructions

## Method 1: Load Unpacked Extension (Recommended)

1. Download and extract the ZIP file
2. Open Google Chrome
3. Navigate to \`chrome://extensions/\`
4. Enable **Developer mode** (toggle in top right corner)
5. Click **Load unpacked** button
6. Select the extracted folder containing the extension files
7. The extension will be installed and ready to use

## Method 2: Load from ZIP

1. Download the ZIP file
2. Open Google Chrome
3. Navigate to \`chrome://extensions/\`
4. Enable **Developer mode**
5. Drag and drop the ZIP file onto the extensions page
6. Chrome will automatically extract and install the extension

## Features Included:
${releaseNotes.features.map(feature => `- ${feature}`).join('\n')}

**Application:** ${appName}
**Version:** ${version} Alpha
**File:** \`${appName.toLowerCase().replace(/\.\.\./g, '').replace(/\s+/g, '-')}-v${version}.zip\`
`;

fs.writeFileSync(path.join('release', 'INSTALLATION.md'), installationInstructions);

// Create release notes
const releaseNotesContent = `# ${appName} v${version}

## What's New
${releaseNotes.whatsNew.map(item => `- ${item}`).join('\n')}

## System Requirements
${releaseNotes.systemRequirements.map(req => `- ${req}`).join('\n')}

## Quick Start
1. Install the extension using the instructions in \`INSTALLATION.md\`
2. Visit any login form - AutoFill button will appear
3. Click AutoFill to populate test credentials
4. Use the extension popup to access settings

## Test Credentials
- Username: \`testLogin\`
- Password: \`testPassword\`

## Support
For issues and feature requests, please contact the development team.
`;

fs.writeFileSync(path.join('release', 'README-RELEASE.md'), releaseNotesContent);

// Create ZIP file
console.log('Creating ZIP archive...');
const zipFileName = `${appName.toLowerCase().replace(/\.\.\./g, '').replace(/\s+/g, '-')}-v${version}.zip`;

try {
  execSync(`cd release && zip -r ${zipFileName} v${version} INSTALLATION.md README-RELEASE.md`, { stdio: 'inherit' });
} catch (error) {
  console.log('ZIP command failed, using PowerShell...');
  execSync(`powershell -Command "Compress-Archive -Path 'release\\v${version}\\*','release\\INSTALLATION.md','release\\README-RELEASE.md' -DestinationPath 'release\\${zipFileName}' -Force"`, { stdio: 'inherit' });
}

console.log(`${appName} v${version} release created successfully!`);
console.log(`ZIP file: release/${zipFileName}`);