import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  plugins: [react()],
  // In locale restiamo su '/', su GitHub Pages pubblichiamo su '/<repo>/'
  base: isGitHubPages && repositoryName ? `/${repositoryName}/` : '/',
});
