import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import { register } from '../api/authentication'

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
  state = {
    email: '',
    password: '',
    confirmPassword: '',
    showDialog: false
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  onSubmit = async () => {
    event.preventDefault()

    const { email, password } = this.state

    if (await register(email, password)) {
      this.props.onSuccess()
    } else {
      this.setState({ showDialog: true })
    }
  }

  render () {
    const { classes } = this.props
    const { email, password, confirmPassword, showDialog } = this.state

    const isRegisterable = email && password && password === confirmPassword

    return (
      <div>

        <Dialog open={showDialog} onClick={() => this.setState({ showDialog: false })}>
          <DialogContent>
            <DialogContentText>Failed to register</DialogContentText>
          </DialogContent>
        </Dialog>

        <form className={classes.container} noValidate autoComplete='off' onSubmit={this.onSubmit}>
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
                type='submit'
                variant='contained'
                color='primary'
                className={classes.button}
                disabled={!isRegisterable}
              >
                Register
              </Button>
            </Grid>
          </Grid>
        </form>

      </div>
    )
  }
}
Register.propTypes = {
  classes: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default withStyles(styles)(Register)
