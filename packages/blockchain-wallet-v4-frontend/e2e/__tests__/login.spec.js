describe('Login', () => {
  beforeAll(async () => {
    await page.goto('localhost:8080')
  })

  it('should be able to login', async () => {
    await page.click('input[name=guid]')
    await page.type('input[name=guid]', '123456780-0987654321')
    await page.click('input[name=password]')
    await page.type('input[name=password]', 'testinge')
    await page.click('button[type=submit]')
    await expect(page).toFill('input[name=guid]', 'James')
  })
})
