// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,

  use: {
    // 本地静态文件服务器地址
    baseURL: 'http://localhost:3000',
    // 测试时放慢速度，让你看清每一步（毫秒）
    slowMo: 600,
    // 截图：失败时自动截图
    screenshot: 'only-on-failure',
    // 录制视频：每次都录
    video: 'on',
    // 高亮鼠标轨迹
    trace: 'on',
  },

  // 启动本地静态服务器
  webServer: {
    command: 'npx serve . -p 3000 -s',
    port: 3000,
    reuseExistingServer: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
});
