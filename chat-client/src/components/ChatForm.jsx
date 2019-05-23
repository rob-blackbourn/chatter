import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
})

class Chat extends React.Component {
  state = {
    content: ''
  }

  onSubmit = async event => {
    event.preventDefault()
    this.props.onContent(this.state.content)
    this.setState({ content: '' })
  }

  render () {
    const { classes } = this.props
    const { content } = this.state

    return (
      <form component='fieldset' onSubmit={this.onSubmit}>
        <FormGroup>
          <TextField
            label='Message'
            className={classes.textField}
            value={content}
            onChange={event =>
              this.setState({ content: event.target.value })
            }
            margin='normal'
          />
        </FormGroup>
      </form>
    )
  }
}
Chat.propTypes = {
  classes: PropTypes.object.isRequired,
  onContent: PropTypes.func.isRequired
}

export default withStyles(styles)(Chat)
