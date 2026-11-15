import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import {defineConfig} from 'eslint/config';
export default defineConfig([{ignores:['dist/**','node_modules/**']},{files:['src/**/*.{js,jsx}'],extends:[js.configs.recommended,hooks.configs.flat.recommended,refresh.configs.vite],languageOptions:{globals:globals.browser,parserOptions:{ecmaFeatures:{jsx:true}}}},{files:['tests/**/*.js'],extends:[js.configs.recommended],languageOptions:{globals:globals.node}}]);
