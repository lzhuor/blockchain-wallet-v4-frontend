describe('Login', () => {
  const baseUrl = 'http://localhost:8080'
  const testWalletGuid = '564b1d95-10e3-4e06-bb92-fced7c545811'
  const testWalletKey = 'f@ke@ccount123'

  beforeAll(async () => {
    jest.setTimeout(20000) // 20 second timeout for navigation
  })

  beforeEach(async () => {
    await page.goto(baseUrl)
  })

  it('should be able to login with correct wallet guid and key', async () => {
    await expect(page).toFill('input[name=guid]', testWalletGuid)
    await page.type('input[name=password]', testWalletKey)
    await page.click('button[type=submit]')
    const navigationPromise = page.waitForNavigation()
    await navigationPromise
    await expect(page.url()).toEqual(`${baseUrl}/home`)
  })

  it('should not be able to login with correct wallet guid and incorrect key', async () => {
    await expect(page).toFill('input[name=guid]', testWalletGuid)
    await page.type('input[name=password]', 'badpassword')
    await page.click('button[type=submit]')
    await expect(page).toMatch('Error decrypting wallet. Wrong password')
  })

  // it('should not be able to login with incorrect wallet guid and correct key', async () => {
  //   await expect(page).toFill('input[name=guid]', '123fake-guid-1233-test-123532')
  //   await page.type('input[name=password]', testWalletKey)
  //   await page.click('button[type=submit]')
  //   console.info(await page.$('#ft-error'))
  //   await expect(page).toMatch('Unknown Wallet ID. If you need a reminder')
  //   //console.info(errorMsgVisible)
  //   //await expect(errorMsgVisible).toBeTruthy()
  // })
})
