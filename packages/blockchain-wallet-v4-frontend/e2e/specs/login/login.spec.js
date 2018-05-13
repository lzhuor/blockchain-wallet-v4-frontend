import constants from './../constants'
import appSelectors from './../selectors'

describe('Login Page', () => {
  const selectors = appSelectors.login

  beforeAll(async () => {
    // 20 second timeout for navigation
    jest.setTimeout(20000)
  })

  beforeEach(async () => {
    await page.goto(constants.urls.base)
  })

  describe('Wallet Login', () => {
    it('should not be able to login with correct wallet guid and incorrect key', async () => {
      await expect(page).toFill(selectors.inputs.walletGuid, constants.wallet.validGuid)
      await page.type(selectors.inputs.walletKey, 'badpassword')
      await page.click(selectors.buttons.walletLogin)
      await expect(page).toMatchElement(selectors.messages.invalidPassword, { timeout: 2000 })
    })

    it('should not be able to login with incorrect wallet guid and correct key', async () => {
      await expect(page).toFill(selectors.inputs.walletGuid, '123fake-guid')
      await page.type(selectors.inputs.walletKey, constants.wallet.validKey)
      await page.click(selectors.buttons.walletLogin)
      await expect(page).toMatchElement(selectors.messages.invalidGuid, { timeout: 2000 })
    })

    it('should be able to login with correct wallet guid and key', async () => {
      await expect(page).toFill(selectors.inputs.walletGuid, constants.wallet.validGuid)
      await page.type(selectors.inputs.walletKey, constants.wallet.validKey)
      await page.click(selectors.buttons.walletLogin)
      const navigationPromise = page.waitForNavigation()
      await navigationPromise
      await expect(page.url()).toEqual(constants.urls.home)
    })
  })

  describe('Login Help', () => {
    beforeEach(async () => {
      await page.click(selectors.links.help)
    })

    it('should be able to access help page and then return to login page', async () => {
      await expect(page.url()).toEqual(constants.urls.help)
      await page.click(selectors.links.login)
      await expect(page.url()).toEqual(constants.urls.login)
    })

    describe('Wallet ID Reminder', () => {
      beforeEach(async () => {
        await page.click(selectors.buttons.walletIdReminder)
      })

      it('should be able access reminder page and then return to help page', async () => {
        await expect(page.url()).toEqual(constants.urls.walletReminder)
        await page.click(selectors.links.help)
        await expect(page.url()).toEqual(constants.urls.help)
      })
    })

    describe('Recover Funds', () => {
      beforeEach(async () => {
        await page.click(selectors.buttons.walletRecover)
      })

      it('should be able to access recover page and then return to help page', async () => {
        await expect(page.url()).toEqual(constants.urls.walletRecover)
        await page.click(selectors.links.help)
        await expect(page.url()).toEqual(constants.urls.help)
      })
    })

    describe('2FA Reset', () => {
      beforeEach(async () => {
        await page.click(selectors.buttons.wallet2faReset)
      })

      it('should be able to access 2FA reset page and then return to help page', async () => {
        await expect(page.url()).toEqual(constants.urls.wallet2faReset)
        await page.click(selectors.links.help)
        await expect(page.url()).toEqual(constants.urls.help)
      })
    })
  })
})
