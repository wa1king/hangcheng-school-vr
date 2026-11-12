import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function preloadCampusModel(): Plugin {
  let href: string | undefined;
  return {
    name: 'preload-campus-model',
    apply: 'build',
    configResolved(config) {
      if (!config.publicDir) return;
      const manifest = JSON.parse(readFileSync(resolve(config.publicDir, 'scene/scene.json'), 'utf8'));
      const file: unknown = manifest.models?.[0]?.url;
      if (typeof file !== 'string') return;

      const relative = config.base === './' || config.base === '';
      const base = new URL(config.base || './', 'https://campus-build.invalid/site/');
      const url = new URL(file, new URL('scene/scene.json', base));
      if (url.origin !== base.origin || !url.pathname.toLowerCase().endsWith('.glb')) return;

      if (relative) {
        if (url.pathname.startsWith(base.pathname)) {
          href = `./${url.pathname.slice(base.pathname.length)}${url.search}`;
        }
      } else {
        href = config.base.startsWith('/') ? `${url.pathname}${url.search}` : url.href;
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (!href) return;
        return [{
          tag: 'link',
          attrs: { rel: 'preload', as: 'fetch', href, crossorigin: 'anonymous', fetchpriority: 'low' },
          injectTo: 'head',
        }];
      },
    },
  };
}

export default defineConfig({
  plugins: [preloadCampusModel()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-runtime', test: /[/\\]node_modules[/\\]three[/\\]/ },
            { name: 'physics-runtime', test: /[/\\]node_modules[/\\]@dimforge[/\\]rapier3d-compat[/\\]/ },
          ],
        },
      },
    },
  },
});
