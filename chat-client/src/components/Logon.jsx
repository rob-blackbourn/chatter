import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import CONFIG from '../config'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '300'
  },
  button: {
    margin: theme.spacing.unit
  }
})

class Logon extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      email: '',
      password: ''
    }
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleLogon = async () => {
    const { email, password } = this.state
    const url = CONFIG.authenticateEndpoint

    console.log(url)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) {
        throw new Error('failed to authenticate')
      }

      this.props.onSuccess()
    } catch (error) {
      console.log(error)
    }
  }

  render () {
    const { classes } = this.props
    const { email, password } = this.state

    const isValid = email && password

    return (
      <form className={classes.container} noValidate autoComplete='off'>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              id='filled-email-input'
              label='Email'
              className={classes.textField}
              value={email}
              onChange={this.handleChange('email')}
              type='email'
              name='email'
              autoComplete='email'
              margin='normal'
              variant='filled'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id='filled-password-input'
              label='Password'
              className={classes.textField}
              value={password}
              onChange={this.handleChange('password')}
              type='password'
              autoComplete='current-password'
              margin='normal'
              variant='filled'
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              color='primary'
              className={classes.button}
              disabled={!isValid}
              onClick={this.handleLogon}
            >
              Logon
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  }
}

Logon.propTypes = {
  classes: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default withStyles(styles)(Logon)
