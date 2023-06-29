const fs = require('fs');
const path = require('path');

// Define directories and files to be created
const structure = {
  name: 'search-engine',
  type: 'directory',
  children: [
    {
      name: 'src',
      type: 'directory',
      children: [
        { name: 'controllers', type: 'directory' },
        { name: 'models', type: 'directory' },
        { name: 'routes', type: 'directory' },
        { name: 'services', type: 'directory' },
        { name: 'app.ts', type: 'file' },
        { name: 'server.ts', type: 'file' },
      ],
    },
    { name: 'tests', type: 'directory' },
    { name: '.dockerignore', type: 'file' },
    { name: '.gitignore', type: 'file' },
    { name: 'Dockerfile', type: 'file' },
    { name: 'docker-compose.yml', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
  ],
};

// Function to create directory
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

// Function to create file
const createFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8');
  }
};

// Function to create the directory structure
const createStructure = (basePath, structure) => {
  const newPath = path.join(basePath, structure.name);

  if (structure.type === 'directory') {
    createDirectory(newPath);
    if (structure.children) {
      structure.children.forEach((child) =>
        createStructure(newPath, child)
      );
    }
  } else if (structure.type === 'file') {
    createFile(newPath);
  }
};

createStructure(__dirname, structure);
