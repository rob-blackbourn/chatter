import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Login from './Logon'
import Register from './Register'

const styles = theme => ({})

class Authenticate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isRegistered: true
    }
  }
  render () {
    const { onSuccess } = this.props

    return (
      <div>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.isRegistered}
                onChange={event =>
                  this.setState({ isRegistered: event.target.checked })
                }
                value='isRegistered'
              />
            }
            label={this.state.isRegistered ? 'Register' : 'Logon'}
          />
        </FormGroup>
        {this.state.isRegistered ? (
          <Login onSuccess={onSuccess} />
        ) : (
          <Register onSuccess={onSuccess} />
        )}
      </div>
    )
  }
}
Authenticate.propTypes = {
  classes: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default withStyles(styles)(Authenticate)
