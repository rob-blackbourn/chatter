import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import Login from './Logon'
import Register from './Register'

const styles = theme => ({
  container: {
    margin: theme.spacing.unit
  }
})

class Authenticate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      register: false
    }
  }
  render () {
    const { classes, onSuccess } = this.props
    const { register } = this.state

    return (
      <div className={classes.container}>
        <Typography variant='h4'>{register ? 'Register' : 'Sign In'}</Typography>
        {register ? (
          <Register onSuccess={onSuccess} />
        ) : (
          <Login onSuccess={onSuccess} />
        )}
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={register}
                onChange={event =>
                  this.setState({ register: event.target.checked })
                }
                value='register'
              />
            }
            label='Register'
          />
        </FormGroup>
      </div>
    )
  }
}
Authenticate.propTypes = {
  classes: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default withStyles(styles)(Authenticate)
