import constants from './../constants'
import appSelectors from './../selectors'

describe('Login Page', () => {
  const selectors = appSelectors.login
  const slowTimeout = { timeout: 10000 }
  const verySlowTimeout = { timeout: 10000 }

  beforeAll(async () => {
    // 30 second timeout for each test
    jest.setTimeout(30000)
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
      await page.once('networkidle0', () => {
        expect(page.url()).toEqual(constants.urls.help)
      })
    })
  })

  describe('Login Help', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.help, { waitUntil: 'domcontentloaded' }, () => {
        expect(page.url()).toEqual(constants.urls.help)
      })
    })

    it('should be able to access help page and then return to login page', async () => {
      await page.once('domcontentloaded', async () => {
        await expect(page).toClick(selectors.links.login, verySlowTimeout)
        await page.once('networkidle0', () => {
          expect(page.url()).toEqual(constants.urls.login)
        })
      })
    })

    it('should have working links to reminder, recover and 2fa reset pages', async () => {
      // reminder
      await expect(page).toClick(selectors.buttons.walletIdReminder, verySlowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
      // recover
      await expect(page).toClick(selectors.buttons.walletRecover, slowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
      // 2fa reset
      await expect(page).toClick(selectors.buttons.wallet2faReset, slowTimeout)
      await expect(page).toClick(selectors.links.help, slowTimeout)
    })
  })

  describe('Wallet ID Reminder', () => {
    it('should validate email address and captcha entered', async () => {
      await page.goto(constants.urls.walletReminder, { waitUntil: 'domcontentloaded', timeout: 10000 }, async () => {
        expect(page.url()).toEqual(constants.urls.walletReminder)

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
        console.log('111111')
        await page.focus(selectors.inputs.captcha)
        console.log('2222222')
        await page.focus(selectors.links.help)
        await expect(page).toMatchElement(selectors.messages.invalidCaptcha)
        // make captcha valid
        await expect(page).toFill(selectors.inputs.captcha, 'fake123', slowTimeout)
        await expect(page).not.toMatchElement(selectors.messages.invalidCaptcha)
        // reminder button enabled
        await expect(page).toClick(selectors.buttons.defaultSubmit, slowTimeout)
      })
    })
  })

  describe('Recover Funds', () => {
    beforeEach(async () => {
      await page.goto(constants.urls.walletRecover, { waitUntil: 'networkidle0' }, () => {
        expect(page.url()).toEqual(constants.urls.walletRecover)
      })
    })

    describe('Step 1', () => {
      it('should only allow continue when 12 words are entered', async () => {
        const fakeMnemonicArray = constants.wallet.walletMnemonic.split(' ')
        let i = 1

        while (i <= 12) {
          await expect(page).toFill(selectors.inputs.mnemonic, fakeMnemonicArray.slice(0, i).join(' '), slowTimeout)
          // change focus to enable validator
          await page.focus(selectors.links.help)

          if (i === 12) {
            // valid
            await expect(page).not.toMatchElement(selectors.messages.invalidMnemonic, verySlowTimeout)
            await expect(page).toMatchElement(selectors.buttons.defaultSubmit, verySlowTimeout)
          } else {
            // invalid
            await expect(page).toMatchElement(selectors.messages.invalidMnemonic, verySlowTimeout)
            await expect(page).toMatchElement(`${selectors.buttons.defaultSubmit}:disabled`, verySlowTimeout)
          }
          i++
        }
      })
    })

    describe('Step 2', () => {
      beforeEach(async () => {
        // fill out mnemonic and continue
        await expect(page).toFill(selectors.inputs.mnemonic, constants.wallet.walletMnemonic, slowTimeout)
        await expect(page).toClick(selectors.buttons.defaultSubmit, slowTimeout)
      })

      it('should require all fields be filled in', async () => {
        await page.focus(selectors.inputs.email)
        await page.focus(selectors.inputs.password)
        await page.focus(selectors.inputs.passwordConfirm)
        await page.focus(selectors.inputs.termsCheckbox)
        await expect(page).toMatchElement(selectors.messages.invalidEmail, verySlowTimeout)
        await expect(page).toMatchElement(selectors.messages.invalidPasswordConfirm, verySlowTimeout)
        await expect(page).toMatchElement(selectors.messages.invalidPasswordRecover, verySlowTimeout)
      })

      it('should enforce that passwords match', async () => {
        await expect(page).toFill(selectors.inputs.password, 'f@kep@ssword123', slowTimeout)
        await expect(page).toFill(selectors.inputs.passwordConfirm, 'fakepassword321', slowTimeout)
        await page.focus(selectors.inputs.termsCheckbox)
        await expect(page).toMatchElement(selectors.messages.invalidPasswordConfirm, verySlowTimeout)
      })

      it('should only enable recover button when form is valid and terms agreed to', async () => {
        const pw = 'f@kep@ssword123'
        await expect(page).toFill(selectors.inputs.email, 'a@test.com', verySlowTimeout)
        await expect(page).toFill(selectors.inputs.password, pw, slowTimeout)
        await expect(page).toFill(selectors.inputs.passwordConfirm, pw, slowTimeout)
        await expect(page).toClick(selectors.inputs.termsCheckbox, slowTimeout)
        await expect(page).not.toMatchElement(selectors.messages.invalidPasswordConfirm, slowTimeout)
        await expect(page).not.toMatchElement(selectors.messages.invalidPasswordRecover, slowTimeout)
        await expect(page).not.toMatchElement(selectors.messages.invalidEmail, slowTimeout)
        await expect(page).toMatchElement(selectors.buttons.defaultSubmit, verySlowTimeout)
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
