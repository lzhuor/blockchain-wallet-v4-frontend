module.exports = {
  login: {
    buttons: {
      walletIdReminder: 'button[href="/reminder"]',
      walletRecover: 'button[href="/recover"]',
      wallet2faReset: 'button[href="/reset2fa"]',
      walletLogin: 'button[type=submit]'
    },
    inputs: {
      walletGuid: 'input[name=guid]',
      walletKey: 'input[name=password]'
    },
    messages: {
      invalidGuid: '#ft-invalid-guid',
      invalidPassword: '#ft-invalid-pw'
    },
    links: {
      help: 'a[href="/help"]',
      login: 'a[href="/login"]'
    }
  }
}
