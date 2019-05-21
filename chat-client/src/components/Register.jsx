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
    wdith: 300
  },
  button: {
    margin: theme.spacing.unit
  }
})

class Register extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      confirmPassword: ''
    }
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleRegister = async () => {
    const { email, password } = this.state

    try {
      const response = await fetch(CONFIG.registerEndpoint, {
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
    const { email, password, confirmPassword } = this.state

    const isRegisterable = email && password && password === confirmPassword

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
            <TextField
              id='filled-current-password-input'
              label='Confirm password'
              className={classes.textField}
              value={confirmPassword}
              onChange={this.handleChange('confirmPassword')}
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
              disabled={!isRegisterable}
              onClick={this.handleRegister}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  }
}
Register.propTypes = {
  classes: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default withStyles(styles)(Register)
