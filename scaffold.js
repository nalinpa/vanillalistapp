const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---

// Directories to completely ignore during traversal
const IGNORE_DIRS = ['node_modules', '.git', '.expo', 'ios', 'android', 'dist', 'web-build'];

// Define your mappings. 
const REPLACEMENTS = {
  // --- APP BRANDING ---
  '__APP_TAGLINE__': 'Journey through Middle-earth',
  '__APP_NAME__': 'MiddleEarthExplorer', 
  '__PRIMARY_COLOR_TRANSPARENT__': 'rgba(44, 85, 48, 0.2)', 
  '__PRIMARY_COLOR__': '#2C5530', 
  '__PRIMARY_LIGHT_BG__': 'rgba(44, 85, 48, 0.1)',
  '__PRIMARY_DARK_COLOR__': '#1A3A1E',
  '__PRIMARY_COLOR_TRANSPARENT__': 'rgba(44, 85, 48, 0.2)',
  '__HERO_COLOR__': '#FF6B35',

  // --- ENTITY PLURALS ---
  '__ENTITY_PLURAL__': 'FilmingLocations',
  '__ENTITY_PLURAL_LOWER__': 'filmingLocations',
  '__ENTITY_SINGULAR__': 'FilmingLocation',
  '__Entity__': 'FilmingLocation',
  '__Entities__': 'filmingLocations',
  '__entity__': 'FilmingLocation',
  '__entities__': 'filmingLocations',
  '__Locations__': 'FilmingLocations',
  '__locations__': 'filmingLocations',

  // --- ENTITY SINGULARS ---
  '__ENTITY_SINGULAR__': 'FilmingLocation',
  '__ENTITY__': 'FilmingLocation',
  '__Location__': 'FilmingLocation',
  '__location__': 'filmingLocation',
};

// Automatically sort keys from longest to shortest to prevent partial string matches
// (e.g., matching __ENTITY__ inside __ENTITY_PLURAL_LOWER__)
const SORTED_PLACEHOLDERS = Object.keys(REPLACEMENTS).sort((a, b) => b.length - a.length);

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

      for (const placeholder of SORTED_PLACEHOLDERS) {
        const replacement = REPLACEMENTS[placeholder];
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
      for (const placeholder of SORTED_PLACEHOLDERS) {
        const replacement = REPLACEMENTS[placeholder];
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
  if (dirPath !== TARGET_DIR) {
    const dirName = path.basename(dirPath);
    let newDirName = dirName;
    
    for (const placeholder of SORTED_PLACEHOLDERS) {
      const replacement = REPLACEMENTS[placeholder];
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