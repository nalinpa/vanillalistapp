const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---

// Directories to completely ignore during traversal
const IGNORE_DIRS = ['node_modules', '.git', '.expo', 'ios', 'android', 'dist', 'web-build'];

// Define your mappings. 
// IMPORTANT: Put plurals/longer strings first to prevent partial replacements!
const REPLACEMENTS = {
  '__Locations__': 'FilmingLocations',
  '__locations__': 'filmingLocations',
  '__Location__': 'FilmingLocation',
  '__location__': 'filmingLocation',
  '__ENTITY__': 'FilmingLocation',
};

// The directory to start processing ('.' means the current root directory)
const TARGET_DIR = '.'; 

// --- SCRIPT LOGIC ---

function processDirectory(dirPath) {
  // Read all contents of the current directory
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // 1. Process child files and directories first (Bottom-Up approach)
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        processDirectory(fullPath); // Recurse into subdirectory
      }
    } else {
      // It's a file. Step A: Replace internal text content.
      let content = fs.readFileSync(fullPath, 'utf8');
      let contentModified = false;

      for (const [placeholder, replacement] of Object.entries(REPLACEMENTS)) {
        if (content.includes(placeholder)) {
          // split/join acts as a global replace without needing regex escaping
          content = content.split(placeholder).join(replacement);
          contentModified = true;
        }
      }

      if (contentModified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`📝 Updated content: ${fullPath}`);
      }

      // Step B: Rename the file if its name contains a placeholder.
      let newFileName = entry.name;
      for (const [placeholder, replacement] of Object.entries(REPLACEMENTS)) {
        if (newFileName.includes(placeholder)) {
          newFileName = newFileName.split(placeholder).join(replacement);
        }
      }

      if (newFileName !== entry.name) {
        const newFullPath = path.join(dirPath, newFileName);
        fs.renameSync(fullPath, newFullPath);
        console.log(`📄 Renamed file: ${entry.name} -> ${newFileName}`);
      }
    }
  }

  // 2. Rename the current directory (Done after processing children to preserve paths)
  // We don't rename the root directory itself.
  if (dirPath !== TARGET_DIR) {
    const dirName = path.basename(dirPath);
    let newDirName = dirName;
    
    for (const [placeholder, replacement] of Object.entries(REPLACEMENTS)) {
      if (newDirName.includes(placeholder)) {
        newDirName = newDirName.split(placeholder).join(replacement);
      }
    }

    if (newDirName !== dirName) {
      const parentDir = path.dirname(dirPath);
      const newDirPath = path.join(parentDir, newDirName);
      fs.renameSync(dirPath, newDirPath);
      console.log(`📁 Renamed directory: ${dirName} -> ${newDirName}`);
    }
  }
}

// --- EXECUTION ---
console.log('🚀 Starting scaffolding process...');
try {
  processDirectory(TARGET_DIR);
  console.log('✅ Scaffolding complete!');
} catch (error) {
  console.error('❌ An error occurred:', error);
}