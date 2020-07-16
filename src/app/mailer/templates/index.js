import { ejs } from 'consolidate';
import * as path from 'path';

export const renderTemplate = async (name, data) => {
  const templatePath = path.resolve(__dirname, `main/${name}/template`);

  let html = await ejs(`${templatePath}.html`, data);
  html = await ejs(`${path.resolve(__dirname, 'base.html')}`, { template: html });
  const text = await ejs(`${templatePath}.txt`, data);

  return { html, text };
};
