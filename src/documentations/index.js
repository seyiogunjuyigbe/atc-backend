const path = require('path');
const { readFileSync, readdirSync } = require('fs');

export const loadPaths = () => {
  let yamls = '';
  const basePath = path.join(__dirname, 'paths');
  readdirSync(basePath).forEach((file) => {
    yamls += readFileSync(`${basePath}/${file}`, 'utf8');
  });
  return yamls;
};

export const loadModels = () => {
  let yamls = '';
  const basePath = path.join(__dirname, 'models');
  readdirSync(basePath).forEach((file) => {
    yamls += readFileSync(`${basePath}/${file}`, 'utf8');
  });
  return yamls;
};

export const loadDefinitions = () => {
  let yamls = '';
  const basePath = path.join(__dirname, 'definitions');
  readdirSync(basePath).forEach((file) => {
    yamls += readFileSync(`${basePath}/${file}`, 'utf8');
  });
  return yamls;
};
