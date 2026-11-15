import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Địa chỉ cũ của phần Điện tử cơ bản (khi còn là tab riêng) → địa chỉ mới trong mục Dự án
const dtOld = ['', '/dung-cu-do', '/bai-1', '/bai-2', '/bai-3', '/bai-4', '/bai-5', '/bai-6', '/bai-7', '/bai-8'];
const redirects = Object.fromEntries(dtOld.map((p) => [`/dien-tu-co-ban${p}`, `/du-an/dien-tu-co-ban${p}`]));

// https://astro.build/config
export default defineConfig({
  site: 'https://trinhgiakhiem.info.vn',
  integrations: [sitemap()],
  redirects
});
