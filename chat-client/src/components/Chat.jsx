import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
// import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import LinearProgress from '@material-ui/core/LinearProgress'
import InfiniteScroll from 'react-infinite-scroller'
import { DateTime } from 'luxon'
import {
  graphQLReconnectingSubscriber,
  graphQLRetryFetch,
  retryFetchOptions
} from '@jetblack/graphql-reconnect-client'
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

class Chat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      content: '',
      hasMoreItems: true,
      messages: []
    }
    this.messagesEnd = React.createRef()
    this.abortController = new AbortController()
  }

  processSubscription (response) {
    console.log(response)
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

    graphQLReconnectingSubscriber(url, options, (error, subscribe) => {
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
    this.setState((state, props) => ({ messages: [...state.messages, ...response.data.replayMessages] }), this.startSubscription)
  }

  loadMore = () => {
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
    const endDate = messages.length === 0 ? new Date() : new Date(Math.min(...messages.map(x => x.timestamp.valueOf())))
    const startDate = DateTime.fromJSDate(endDate)
      .plus({ days: -1 })
      .toJSDate()

    const variables = { startDate, endDate }
    const operationName = null

    graphQLRetryFetch(url, query, variables, operationName, {
      ...retryFetchOptions,
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

  onSubmit = async event => {
    event.preventDefault()

    const { content } = this.state

    const url = CONFIG.graphqlQueryEndpoint
    const query = `
      query SendMessage($content: String!) {
        replayMessages(content: $content) {
          timestamp
          email
          content
        }
      }
      `
    const variables = { content }
    const operationName = null

    graphQLRetryFetch(url, query, variables, operationName, {
      ...retryFetchOptions,
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
  }

  scrollToLastMessage = () => {
    this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }

  componentDidMount () {
    this.scrollToLastMessage()
  }

  componentWillUnmount () {
    this.abortController.abort()
  }

  render () {
    const { classes } = this.props
    const { content, messages, hasMoreItems } = this.state

    return (
      <div className={classes.container}>

        <header className={classes.header}>
          <Typography variant='h1'>Example</Typography>
        </header>

        <div className={classes.body} id='scrollId'>

          <InfiniteScroll
            loadMore={this.loadMore}
            hasMore={hasMoreItems}
            loader={<LinearProgress key={-1} />}
            isReverse
            initialLoad
            useWindow={false}
          >
            {messages.map((message, index) => (
              <Card key={index}>
                <CardHeader
                  title={message.email}
                  titleTypographyProps={({ variant: 'h5' })}
                  subheader={message.timestamp.toLocaleString()}
                />
                <CardContent>
                  <Typography component='p'>{message.content}</Typography>
                </CardContent>
              </Card>
            ))}
            <div key={messages.length} ref={this.messagesEnd} />
          </InfiniteScroll>
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
                onChange={event => this.setState({ content: event.target.value })}
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
