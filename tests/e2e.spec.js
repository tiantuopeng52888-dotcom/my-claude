// @ts-check
const { test, expect } = require('@playwright/test');

/* ═══════════════════════════════════════════════════════════
   NOVA 品牌网站 — 端到端可视化测试
   运行: npx playwright test --headed
   慢放: npx playwright test --headed --project=chromium
═══════════════════════════════════════════════════════════ */

// ── 1. 官网首页加载 ──────────────────────────────────────────
test('官网 | 首页加载 & 品牌展示', async ({ page }) => {
  await page.goto('/');

  // 等待页面完全加载（Supabase 内容渲染后）
  await page.waitForLoadState('networkidle');

  // 页面标题
  await expect(page).toHaveTitle('NOVA — 创新 · 设计 · 未来');

  // Logo 大写 NOVA
  const logo = page.locator('.nav__logo .logo-text').first();
  await expect(logo).toHaveText('NOVA');

  // Hero Badge 无春节文案
  const badge = page.locator('.hero__badge');
  await expect(badge).toBeVisible();
  await expect(badge).not.toContainText('马年');
  await expect(badge).not.toContainText('🎊');
  await expect(badge).toContainText('品牌战略');

  // Hero 主标题
  await expect(page.locator('.hero__headline')).toBeVisible();

  // 统计数字区域
  await expect(page.locator('.hero__stats')).toBeVisible();
});

// ── 2. 导航栏点击平滑滚动 ────────────────────────────────────
test('官网 | 点击导航链接 → 平滑滚动到对应区域', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 点击"关于我们"
  await page.getByRole('link', { name: '关于我们' }).click();
  await page.waitForTimeout(800); // 等待滚动动画

  // #about section 应进入视口
  const aboutSection = page.locator('#about');
  await expect(aboutSection).toBeInViewport({ ratio: 0.3 });

  // 点击"服务"
  await page.getByRole('link', { name: '服务' }).click();
  await page.waitForTimeout(800);
  await expect(page.locator('#services')).toBeInViewport({ ratio: 0.3 });

  // 点击"案例"
  await page.getByRole('link', { name: '案例' }).click();
  await page.waitForTimeout(800);
  await expect(page.locator('#work')).toBeInViewport({ ratio: 0.3 });
});

// ── 3. href="#" 裸链接点击不报错 ────────────────────────────
test('官网 | 点击 Logo 和服务卡片链接不抛出 JS 错误', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 点击 Logo（href="#"）
  await page.locator('.nav__logo').first().click();
  await page.waitForTimeout(200);

  // 点击 6 个服务卡片的"了解详情"链接（href="#"）
  const serviceLinks = page.locator('.service-link');
  const count = await serviceLinks.count();
  for (let i = 0; i < count; i++) {
    await serviceLinks.nth(i).click();
    await page.waitForTimeout(100);
  }

  // 验证整个过程无 JS 错误
  expect(errors.filter(e => e.includes('SyntaxError'))).toHaveLength(0);
  expect(errors).toHaveLength(0);
});

// ── 4. 移动端菜单开关 ────────────────────────────────────────
test('官网 | 移动端菜单展开与关闭', async ({ page }) => {
  // 模拟手机屏幕尺寸
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const toggle   = page.locator('#navToggle');
  const navLinks = page.locator('.nav__links');

  // 初始：菜单隐藏
  await expect(navLinks).not.toHaveClass(/open/);

  // 点击汉堡菜单
  await toggle.click();
  await page.waitForTimeout(300);
  await expect(navLinks).toHaveClass(/open/);

  // 点击"关于我们"链接 → 菜单自动关闭
  await navLinks.getByRole('link', { name: '关于我们' }).click();
  await page.waitForTimeout(300);
  await expect(navLinks).not.toHaveClass(/open/);
});

// ── 5. 联系表单填写与提交 ────────────────────────────────────
test('官网 | 联系表单完整提交流程', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 滚动到联系区域
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // 填写姓名
  await page.fill('#name', '张三');
  await page.waitForTimeout(200);

  // 填写邮箱
  await page.fill('#email', 'zhangsan@example.com');
  await page.waitForTimeout(200);

  // 选择服务
  await page.selectOption('#service', 'strategy');
  await page.waitForTimeout(200);

  // 填写留言
  await page.fill('#message', '我希望了解贵公司的品牌战略服务，请与我联系。');
  await page.waitForTimeout(300);

  // 提交表单
  const submitBtn = page.locator('#contactForm button[type="submit"]');
  await submitBtn.click();

  // 按钮变为"发送中..."
  await expect(submitBtn).toHaveText('发送中...');
  await expect(submitBtn).toBeDisabled();

  // 等待 1.2s 后恢复
  await page.waitForTimeout(1400);
  await expect(submitBtn).toHaveText('发送消息 →');
  await expect(submitBtn).toBeEnabled();

  // 成功提示出现
  const successMsg = page.locator('#formSuccess');
  await expect(successMsg).toBeVisible();
  await expect(successMsg).toContainText('消息已发送');
});

// ── 6. 页面各 Section 滚动可见性 ─────────────────────────────
test('官网 | 滚动全页面 — 所有区域依次可见', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const sections = [
    { selector: '#about',        name: '关于我们' },
    { selector: '#services',     name: '服务项目' },
    { selector: '#work',         name: '精选案例' },
    { selector: '.process',      name: '合作流程' },
    { selector: '#testimonials', name: '客户口碑' },
    { selector: '.cta-section',  name: 'CTA 区域' },
    { selector: '#contact',      name: '联系我们' },
    { selector: '.footer',       name: '页脚' },
  ];

  for (const { selector, name } of sections) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator(selector)).toBeInViewport({ ratio: 0.2 });
    // 截图留档（保存在 test-results/ 目录）
    await page.screenshot({ path: `test-results/section-${name}.png` });
  }
});

/* ═══════════════════════════════════════════════════════════
   Admin CMS 后台测试
═══════════════════════════════════════════════════════════ */

// ── 7. Admin 登录流程 ─────────────────────────────────────────
test('Admin | 错误密码被拒绝 → 正确密码登录成功', async ({ page }) => {
  await page.goto('/admin.html');

  // 输入错误密码
  await page.fill('#pwdInput', 'wrongpassword');
  await page.click('#loginBtn');
  await page.waitForTimeout(200);

  // 错误提示显示
  const errorEl = page.locator('#loginError');
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toHaveText('密码错误，请重试');

  // CMS 未显示
  await expect(page.locator('#cmsApp')).not.toBeVisible();

  // 输入正确密码
  await page.fill('#pwdInput', 'nova2026');
  await page.click('#loginBtn');
  await page.waitForTimeout(300);

  // CMS 显示，登录界面隐藏
  await expect(page.locator('#cmsApp')).toBeVisible();
  await expect(page.locator('#loginScreen')).not.toBeVisible();
});

// ── 8. Admin 侧边栏导航 ───────────────────────────────────────
test('Admin | 侧边栏各菜单项切换', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#pwdInput', 'nova2026');
  await page.click('#loginBtn');
  await page.waitForTimeout(300);

  const menuItems = [
    { section: 'hero',         title: '首页横幅' },
    { section: 'services',     title: '服务项目' },
    { section: 'work',         title: '精选案例' },
    { section: 'testimonials', title: '客户口碑' },
    { section: 'contact',      title: '联系方式' },
    { section: 'footer',       title: '页脚设置' },
  ];

  for (const { section, title } of menuItems) {
    await page.click(`[data-section="${section}"]`);
    await page.waitForTimeout(300);

    // 对应 section 激活
    await expect(page.locator(`#section-${section}`)).toHaveClass(/active/);
    // 顶部标题更新
    await expect(page.locator('#headerTitle')).toHaveText(title);
  }
});

// ── 9. Admin 精选案例 CRUD ────────────────────────────────────
test('Admin | 精选案例 新增 → 填写 → 删除', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#pwdInput', 'nova2026');
  await page.click('#loginBtn');
  await page.waitForTimeout(400);

  // 进入精选案例
  await page.click('[data-section="work"]');
  await page.waitForTimeout(300);

  const repeater = page.locator('#work-repeater');
  const initialCount = await repeater.locator('.repeater-item').count();

  // 点击新增
  await page.click('.work-add-btn');
  await page.waitForTimeout(300);

  // 数量 +1
  await expect(repeater.locator('.repeater-item')).toHaveCount(initialCount + 1);

  // 填写新案例内容
  const lastItem = repeater.locator('.repeater-item').last();
  await lastItem.locator(`[id^="work-tag-"]`).fill('UI 设计');
  await page.waitForTimeout(200);
  await lastItem.locator(`[id^="work-title-"]`).fill('全新作品展示');
  await page.waitForTimeout(200);
  await lastItem.locator(`[id^="work-desc-"]`).fill('全新的数字设计体验');
  await page.waitForTimeout(200);
  await lastItem.locator(`[id^="work-image-"]`).fill('https://picsum.photos/seed/newwork/800/600');
  await page.waitForTimeout(200);

  // 点击删除
  await lastItem.locator('.item-del-btn').click();
  await page.waitForTimeout(300);

  // 数量恢复
  await expect(repeater.locator('.repeater-item')).toHaveCount(initialCount);
});

// ── 10. Admin Hero Badge 字段检查 ────────────────────────────
test('Admin | Hero Badge 占位符无春节文案', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#pwdInput', 'nova2026');
  await page.click('#loginBtn');
  await page.waitForTimeout(400);

  await page.click('[data-section="hero"]');
  await page.waitForTimeout(300);

  const badgeInput = page.locator('#hero-badge');
  const placeholder = await badgeInput.getAttribute('placeholder');

  expect(placeholder).not.toContain('马年');
  expect(placeholder).not.toContain('🎊');
  expect(placeholder).toContain('品牌战略');

  // 当前填充的值也应正确（来自 Supabase）
  const currentValue = await badgeInput.inputValue();
  if (currentValue) {
    expect(currentValue).not.toContain('马年');
  }
});

// ── 11. Admin 预览网站按钮 ────────────────────────────────────
test('Admin | 点击"预览网站"在新标签打开 index.html', async ({ page, context }) => {
  await page.goto('/admin.html');
  await page.fill('#pwdInput', 'nova2026');
  await page.click('#loginBtn');
  await page.waitForTimeout(300);

  // 监听新标签
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('button:has-text("预览网站")'),
  ]);

  await newPage.waitForLoadState('networkidle');
  await expect(newPage).toHaveTitle('NOVA — 创新 · 设计 · 未来');
  await newPage.close();
});
