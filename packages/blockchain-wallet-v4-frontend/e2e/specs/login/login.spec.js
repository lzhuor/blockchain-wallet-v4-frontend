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

  describe('Login form', () => {
    it('should not be able to login with correct wallet guid and incorrect key', async () => {
      await expect(page).toFill(selectors.guidInput, constants.wallet.validGuid)
      await page.type(selectors.keyInput, 'badpassword')
      await page.click(selectors.loginButton)
      await expect(page).toMatchElement(selectors.invalidPasswordMsg, { timeout: 2000 })
    })

    it('should not be able to login with incorrect wallet guid and correct key', async () => {
      await expect(page).toFill(selectors.guidInput, '123fake-guid')
      await page.type(selectors.keyInput, constants.wallet.validKey)
      await page.click(selectors.loginButton)
      await expect(page).toMatchElement(selectors.invalidGuidMsg, { timeout: 2000 })
    })

    it('should be able to login with correct wallet guid and key', async () => {
      await expect(page).toFill(selectors.guidInput, constants.wallet.validGuid)
      await page.type(selectors.keyInput, constants.wallet.validKey)
      await page.click(selectors.loginButton)
      const navigationPromise = page.waitForNavigation()
      await navigationPromise
      await expect(page.url()).toEqual(constants.urls.home)
    })
  })

  describe('Login help', () => {
    it('should be able to access help page and then return to login', async () => {
      await page.click('a[href="/help"]')
      await expect(page.url()).toEqual(constants.urls.help)
      await page.click('a[href="/login"]')
      await expect(page.url()).toEqual(constants.urls.login)
    })
  })
})
