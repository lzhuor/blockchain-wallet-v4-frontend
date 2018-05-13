module.exports = {
  login: {
    buttons: {
      defaultSubmit: 'button[type=submit]',
      wallet2faReset: 'button[href="/reset2fa"]',
      walletLogin: 'button[type=submit]',
      walletIdReminder: 'button[href="/reminder"]',
      walletRecover: 'button[href="/recover"]'
    },
    inputs: {
      captcha: 'input[name=code]',
      email: 'input[name=email]',
      mnemonic: 'input[name=mnemonic]',
      walletGuid: 'input[name=guid]',
      walletKey: 'input[name=password]',
      password: 'input[name=password]',
      passwordConfirm: 'input[name=confirmationPassword]',
      termsCheckbox: 'input[type=checkbox]'
    },
    messages: {
      invalidCaptcha: '#ft-code-error',
      invalidEmail: '#ft-email-error',
      invalidGuid: '#ft-invalid-guid',
      invalidPassword: '#ft-invalid-pw',
      invalidPasswordRecover: '#ft-password-error',
      invalidPasswordConfirm: '#ft-confirmationPassword-error',
      invalidMnemonic: '#ft-mnemonic-error'
    },
    links: {
      help: 'a[href="/help"]',
      login: 'a[href="/login"]'
    }
  }
}
