import { hot } from 'react-hot-loader'
import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import Chatter from './components/Chatter'

const theme = createMuiTheme({
  palette: {
    type: 'dark'
  },
  typography: {
    useNextVariants: true
  }
})

function App () {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Chatter />
    </MuiThemeProvider>
  )
}

export default hot(module)(App)
