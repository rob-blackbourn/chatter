import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import LinearProgress from '@material-ui/core/LinearProgress'
import { DateTime } from 'luxon'
// import {
//   graphQLReconnectingSubscriber,
//   graphQLRetryFetch,
//   retryFetchOptions
// } from '@jetblack/graphql-reconnect-client'
import {
  graphQLSubscriber,
  graphQLFetch,
  fetchOptions
} from '@jetblack/graphql-client/src'
import CONFIG from '../config'

const styles = theme => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap'
  },
  header: {
    flexShrink: 0
  },
  body: {
    flexGrow: 1,
    overflow: 'auto',
    minHeight: '1em'
  },
  footer: {
    flexShrink: 0
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
})

function toMessage (msg) {
  return {
    timestamp: new Date(msg.timestamp),
    email: msg.email,
    content: msg.content
  }
}

class Chat extends React.Component {
  state = {
    content: '',
    isLoading: false,
    hasMore: true,
    page: 0,
    messages: []
  }
  bodyRef = React.createRef()
  lastMessageRef = React.createRef()
  abortController = new AbortController()

  processSubscription (response) {
    console.log(response)
    this.setState((state, props) => ({
      messages: [ ...state.messages, toMessage(response.listenToMessages) ]
    }), this.scrollToLastMessage)
  }

  startSubscription () {
    const url = CONFIG.graphqlSubscriptionEndpoint
    const options = {}

    const query = `
    subscription {
      listenToMessages {
        timestamp,
        email,
        content
      }
    }
    `
    const variables = {}
    const operationName = null

    graphQLSubscriber(url, options, (error, subscribe) => {
      if (!(error || subscribe)) {
        // No more data
        return
      }
      if (error) {
        console.error(error)
      } else {
        subscribe(query, variables, operationName, (error, response) => {
          if (!(error || response)) {
            // No more data
            return
          }
          if (error) {
            console.error(error)
            throw error
          }
          // this.setState({ isChanging: true }, this.processSubscription(response))
          this.processSubscription(response)
        })
      }
    })
  }

  processQuery (response) {
    console.log(response)
    this.setState(
      (state, props) => ({
        messages: [
          ...response.data.replayMessages.map(x => toMessage(x)),
          ...state.messages
        ],
        hasMore: response.data.replayMessages.length > 0,
        page: state.page + 1,
        isLoading: false
      }), () => {
        const { page } = this.state

        if (page === 1) {
          this.scrollToLastMessage()
        } else {
          this.scrollToFirstMessage()
        }
      })
  }

  startQuery = () => {
    const url = CONFIG.graphqlQueryEndpoint
    const query = `
      query ReplayMessages($startDate: String!, $endDate: String!) {
        replayMessages(startDate: $startDate, endDate: $endDate) {
          timestamp
          email
          content
        }
      }
      `

    const { messages } = this.state
    const endDate =
      messages.length === 0
        ? new Date()
        : new Date(Math.min(...messages.map(x => x.timestamp.valueOf())))
    const startDate = DateTime.fromJSDate(endDate).minus({ days: 1 }).toJSDate()

    const variables = { startDate, endDate }
    const operationName = null

    graphQLFetch(url, query, variables, operationName, {
      ...fetchOptions,
      signal: this.abortController.signal
    })
      .then(response => {
        return response.json()
      })
      .then(response => {
        console.log(response.data)
        this.processQuery(response)
      })
      .catch(error => {
        if (error instanceof DOMException) {
          return
        }
        console.error(error)
      })
  }

  loadMore = () => {
    this.setState((state, props) => {
      if (state.isLoading) {
        return {}
      } else if (!state.hasMore) {
        return { isLoading: false }
      } else {
        setTimeout(this.startQuery, 1)
        return { isLoading: true }
      }
    })
  }

  onSubmit = async event => {
    event.preventDefault()

    const { content } = this.state

    const url = CONFIG.graphqlQueryEndpoint
    const query = `
    mutation SendMessage($content: String!) {
        sendMessage(content: $content) {
          timestamp
          email
          content
        }
      }
      `
    const variables = { content }
    const operationName = null

    graphQLFetch(url, query, variables, operationName, {
      ...fetchOptions,
      signal: this.abortController.signal
    })
      .then(response => {
        return response.json()
      })
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        if (error instanceof DOMException) {
          return
        }
        console.error(error)
      })

    this.setState({ content: '' })
  }

  scrollToFirstMessage = () => {
    this.bodyRef.current.scrollTo({ top: 1, left: 0, behavior: 'smooth' })
  }

  scrollToLastMessage = () => {
    this.lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  scrollListener = () => {
    if (this.bodyRef.current.scrollTop === 0) {
      if (this.state.hasMore) {
        this.loadMore()
      }
    }
  }

  componentDidMount () {
    this.scrollToLastMessage()
    this.bodyRef.current.addEventListener('scroll', this.scrollListener)
    this.startSubscription()
    this.loadMore()
  }

  componentWillUnmount () {
    this.abortController.abort()
    this.bodyRef.current.removeEventListener('scroll', this.scrollListener)
  }

  render () {
    const { classes } = this.props
    const { content, messages, isLoading } = this.state

    return (
      <div className={classes.container}>
        <header className={classes.header}>
          <Typography variant='h2'>Example</Typography>
        </header>

        <div className={classes.body} ref={this.bodyRef}>
          {isLoading
            ? <LinearProgress />
            : messages.map((message, index) => (
              <Card key={index}>
                <CardHeader
                  title={message.email}
                  titleTypographyProps={{ variant: 'h5' }}
                  subheader={message.timestamp.toLocaleString()}
                />
                <CardContent>
                  <Typography component='p'>{message.content}</Typography>
                </CardContent>
              </Card>
            ))}
          <div key={messages.length} ref={this.lastMessageRef} />
        </div>

        <footer className={classes.footer}>
          <form component='fieldset' onSubmit={this.onSubmit}>
            {/* <FormLabel component='legend'>
              Some Legend
            </FormLabel> */}
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
        </footer>
      </div>
    )
  }
}
Chat.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Chat)
