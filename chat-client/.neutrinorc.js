const standard = require('@neutrinojs/standardjs')
const react = require('@neutrinojs/react')

var fs = require('fs')
var os = require('os')

var hostname = process.env.PUBLIC_HOST ? process.env.PUBLIC_HOST : os.hostname()
var fqdn = hostname + '.bhdgsystematic.com'
var pathPrefix = '/chat/ui/'
var publicPath = process.env.PUBLIC_HOST
  ? pathPrefix
  : 'https://' + fqdn + pathPrefix

var homedir = os.homedir()
var keyfilename = homedir + '/.keys/' + hostname + '.key'
var certfilename = homedir + '/.keys/' + hostname + '.crt'

var is_production = process.env.NODE_ENV === 'production'
var key = is_production ? null : fs.readFileSync(keyfilename)
var cert = is_production ? null : fs.readFileSync(certfilename)

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    standard(),
    react({
      html: {
        title: 'neutrino-example2',
      },
      publicPath: '/chatter/ui/',
      devServer: {
        // https: { key, cert },
        // host: fqdn,
        // useLocalIp: true,
        port: 9004,
        disableHostCheck: true,
        // historyApiFallback: {
        //   rewrites: [
        //     {
        //       from: /^\/chat\/ui\/.+$/,
        //       to: '/chat/ui/',
        //     },
        //   ],
        // },
      },
    }),
  ],
}
