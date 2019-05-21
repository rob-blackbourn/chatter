const standard = require('@neutrinojs/standardjs')
const react = require('@neutrinojs/react')

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
        port: 10002,
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
