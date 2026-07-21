import fs from 'fs';
import path from 'path';

const validatorsDir = './src/validators';
const files = fs.readdirSync(validatorsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(validatorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure ERROR_CODES is imported
  if (content.includes('HTTP_STATUS') && !content.includes('ERROR_CODES')) {
    content = content.replace(/HTTP_STATUS(.*?) } from '\.\.\/constants\/index\.js';/, 'HTTP_STATUS$1, ERROR_CODES } from \'../constants/index.js\';');
  } else if (!content.includes('ERROR_CODES')) {
    content = content.replace(/} from '\.\.\/constants\/index\.js';/, ', ERROR_CODES } from \'../constants/index.js\';');
  }

  // Replace new AppError(..., HTTP_STATUS.BAD_REQUEST) with new AppError(..., HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION)
  // using regex that allows line breaks or spaces
  content = content.replace(/new AppError\(([^,]+),\s*HTTP_STATUS\.BAD_REQUEST\)/g, 'new AppError($1, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION)');
  
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed validators');
