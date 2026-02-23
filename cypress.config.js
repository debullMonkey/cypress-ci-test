const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // 기본 baseUrl 없음 - 각 테스트 파일에서 직접 URL 지정
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    // 서버가 뜰 때까지 기다리는 시간 (ms)
    pageLoadTimeout: 30000,
    requestTimeout: 10000,

    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          // Windows에서 bad_message.cc / reason 114 오류 해결
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-software-rasterizer')
          launchOptions.args.push('--disable-background-networking')
        }
        return launchOptions
      })
    },
  },
})
