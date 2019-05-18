import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Chat from './Chat'
import Authenticate from './Authenticate'

const styles = theme => ({})

class Chatter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isAuthenticated: false
    }
  }

  handleSuccess = () => {
    this.setState({ isAuthenticated: true })
  }
  render () {
    return this.state.isAuthenticated ? (
      <Chat />
    ) : (
      <Authenticate onSuccess={this.handleSuccess} />
    )
  }
}
Chatter.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Chatter)
