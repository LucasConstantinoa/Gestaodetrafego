const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', '.gemini', '.vite'];
const EXCLUDED_FILES = ['package-lock.json', 'gerar_texto_ai_studio.js', 'codigo_para_ai_studio.txt', 'projeto_para_ai_studio.zip'];
const EXCLUDED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.zip', '.mp4', '.webm'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!EXCLUDED_DIRS.includes(f)) {
        walkDir(dirPath, callback);
      }
    } else {
      const ext = path.extname(f).toLowerCase();
      if (!EXCLUDED_FILES.includes(f) && !EXCLUDED_EXTENSIONS.includes(ext)) {
        callback(dirPath);
      }
    }
  });
}

let result = 'Este arquivo contem o codigo fonte do projeto React da landing page.\n\n';

try {
  walkDir(__dirname, (filePath) => {
    const relativePath = path.relative(__dirname, filePath);
    result += `\n\n=======================================================\n`;
    result += `Arquivo: ${relativePath}\n`;
    result += `=======================================================\n\n`;
    
    try {
      result += fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      result += `[Erro ao ler o arquivo]\n`;
    }
  });

  fs.writeFileSync(path.join(__dirname, 'codigo_para_ai_studio.txt'), result);
  console.log('Arquivo codigo_para_ai_studio.txt gerado com sucesso!');
} catch (error) {
  console.error('Erro ao gerar arquivo:', error);
}
