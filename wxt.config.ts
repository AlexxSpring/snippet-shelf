import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Snippet Shelf',
    description: 'Save words, commands, code and notes into collections.',
    permissions: ['contextMenus', 'activeTab', 'scripting'],
  },
});