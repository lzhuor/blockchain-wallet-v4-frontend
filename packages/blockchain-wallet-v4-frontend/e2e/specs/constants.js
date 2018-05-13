const baseUrl = 'http://localhost:8080'

module.exports = {
  urls: {
    base: baseUrl,
    home: `${baseUrl}/home`,
    login: `${baseUrl}/login`,
    help: `${baseUrl}/help`,
    walletReminder: `${baseUrl}/reminder`,
    walletRecover: `${baseUrl}/recover`,
    wallet2faReset: `${baseUrl}/reset2fa`
  },
  wallet: {
    validGuid: '564b1d95-10e3-4e06-bb92-fced7c545811',
    validKey: 'f@ke@ccount123',
    walletMnemonic: 'require love voice siege kick maid author expand column olympic minor ramp'
  }
}
