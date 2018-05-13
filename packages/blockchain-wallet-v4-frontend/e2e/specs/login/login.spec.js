import constants from './../constants'
import appSelectors from './../selectors'

describe('Login Page', () => {
  const selectors = appSelectors.login
  const slowTimeout = { timeout: 2500 }
  const verySlowTimeout = { timeout: 5000 }

  beforeAll(async () => {
    // 20 second timeout for navigation
    jest.setTimeout(20000)
  })

  describe('Wallet Login', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.base, { waitUntil: 'domcontentloaded' })
      await page.once('networkidle0', () => {
        expect(page.url()).toEqual(constants.urls.login)
      })
    })

    it('should not be able to login with correct wallet guid and incorrect key', async () => {
      // reset button is disabled
      await expect(page).toMatchElement(`${selectors.buttons.defaultSubmit}:disabled`, slowTimeout)
      await expect(page).toFill(selectors.inputs.walletGuid, constants.wallet.validGuid)
      await expect(page).toFill(selectors.inputs.walletKey, 'badpassword')
      await expect(page).toClick(selectors.buttons.walletLogin)
      await expect(page).toMatchElement(selectors.messages.invalidPassword, verySlowTimeout)
    })

    it('should not be able to login with incorrect wallet guid and correct key', async () => {
      await expect(page).toFill(selectors.inputs.walletGuid, '123fake-guid')
      await expect(page).toFill(selectors.inputs.walletKey, constants.wallet.validKey)
      await expect(page).toClick(selectors.buttons.walletLogin)
      await expect(page).toMatchElement(selectors.messages.invalidGuid, verySlowTimeout)
    })

    it('should be able to login with correct wallet guid and key', async () => {
      await expect(page).toFill(selectors.inputs.walletGuid, constants.wallet.validGuid)
      await expect(page).toFill(selectors.inputs.walletKey, constants.wallet.validKey)
      await expect(page).toClick(selectors.buttons.walletLogin)
      await page.once('networkidle0', () => {
        expect(page.url()).toEqual(constants.urls.home)
      })
    })

    it('should link to the help page', async () => {
      await expect(page).toClick(selectors.links.help)
      await expect(page.url()).toEqual(constants.urls.help)
    })
  })

  describe('Login Help', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.help, { waitUntil: 'domcontentloaded' }, () => {
        expect(page.url()).toEqual(constants.urls.help)
      })
    })

    it('should be able to access help page and then return to login page', async () => {
      await expect(page).toClick(selectors.links.login, slowTimeout)
      await page.once('networkidle0', () => {
        expect(page.url()).toEqual(constants.urls.login)
      })
    })

    it('should have working links to reminder, recover and 2fa reset pages', async () => {
      // reminder
      await expect(page).toClick(selectors.buttons.walletIdReminder, slowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
      // recover
      await expect(page).toClick(selectors.buttons.walletRecover, slowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
      // 2fa reset
      await expect(page).toClick(selectors.buttons.wallet2faReset, slowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
    })

    it('should link out to the correct support page', async () => {
      await expect(page).toClick(selectors.links.help, slowTimeout)
    })
  })

  describe('Wallet ID Reminder', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.walletReminder, { waitUntil: 'domcontentloaded', timeout: 10000 }, () => {
        expect(page.url()).toEqual(constants.urls.walletReminder)
      })
    })

    it('should validate email address and captcha entered', async () => {
      // send reminder button is disabled by default
      await expect(page).toMatchElement(`${selectors.buttons.defaultSubmit}:disabled`, verySlowTimeout)
      // enter invalid email
      await expect(page).toFill(selectors.inputs.email, 'not-valid-email', slowTimeout)
      await page.focus(selectors.links.help)
      await expect(page).toMatchElement(selectors.messages.invalidEmail, slowTimeout)
      // make email valid
      await expect(page).toFill(selectors.inputs.email, 'a@test.com', slowTimeout)
      await expect(page).not.toMatchElement(selectors.messages.invalidEmail)
      // do not enter captcha
      await page.focus(selectors.inputs.captcha)
      await page.focus(selectors.links.help)
      await expect(page).toMatchElement(selectors.messages.invalidCaptcha)
      // make captcha valid
      await expect(page).toFill(selectors.inputs.captcha, 'fake123', slowTimeout)
      await expect(page).not.toMatchElement(selectors.messages.invalidCaptcha)
      // reminder button enabled
      await expect(page).toClick(`${selectors.buttons.defaultSubmit}`, slowTimeout)
    })
  })

  describe('Recover Funds', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.walletRecover, { waitUntil: 'networkidle0' }, () => {
        expect(page.url()).toEqual(constants.urls.walletRecover)
      })
    })

    it('should be able to return to help page', async () => {
      // recover button is disabled
      await expect(page).toMatchElement(`${selectors.buttons.defaultSubmit}:disabled`, verySlowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
      await page.once('networkidle0', () => {
        expect(page.url()).toEqual(constants.urls.help)
      })
    })
  })

  describe('2FA Reset', () => {
    it('should be able to return to help page', async () => {
      await page.goto(constants.urls.wallet2faReset, { waitUntil: 'networkidle0' }, async () => {
        expect(page.url()).toEqual(constants.urls.wallet2faReset)
        await expect(page).toMatchElement(`${selectors.buttons.defaultSubmit}:disabled`, verySlowTimeout)
        await expect(page).toClick(selectors.links.help, slowTimeout)
        await page.once('networkidle0', (page) => {
          expect(page.url()).toEqual(constants.urls.help)
        })
      })
    })
  })
})
