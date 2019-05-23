import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { DateTime } from 'luxon'
import { sendMessage, fetchChats, subscribe } from '../api/chat'
import ChatCard from './ChatCard'
import ChatForm from './ChatForm'

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
    isLoading: false,
    hasMore: true,
    page: 0,
    messages: []
  }
  bodyRef = React.createRef()
  lastMessageRef = React.createRef()
  abortController = new AbortController()

  processSubscription = (response) => {
    console.log(response)
    this.setState((state, props) => ({
      messages: [ ...state.messages, toMessage(response.listenToMessages) ]
    }), this.scrollToLastMessage)
  }

  processQuery = (response) => {
    console.log(response)
    this.setState(
      (state, props) => ({
        messages: [
          ...response.data.replayMessages.map(x => toMessage(x)).sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf()),
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
    const { messages } = this.state

    const endDate =
      messages.length === 0
        ? new Date()
        : new Date(Math.min(...messages.map(x => x.timestamp.valueOf())))
    const startDate = DateTime.fromJSDate(endDate).minus({ days: 1 }).toJSDate()

    fetchChats(startDate, endDate, this.abortController.signal, console.error, this.processQuery)
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

  onContent = async content => {
    sendMessage(content, this.abortController.signal, console.log, console.log)
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
    subscribe(console.error, this.processSubscription)
    this.loadMore()
  }

  componentWillUnmount () {
    this.abortController.abort()
    this.bodyRef.current.removeEventListener('scroll', this.scrollListener)
  }

  render () {
    const { classes } = this.props
    const { messages, isLoading } = this.state

    return (
      <div className={classes.container}>
        <header className={classes.header}>
          <Typography variant='h2'>Chat</Typography>
        </header>

        <div className={classes.body} ref={this.bodyRef}>
          {isLoading
            ? <LinearProgress />
            : messages.map(({ email, timestamp, content }, index) => (
              <ChatCard key={index} email={email} timestamp={timestamp} content={content} />
            ))}
          <div key={messages.length} ref={this.lastMessageRef} />
        </div>

        <footer className={classes.footer}>
          <ChatForm onContent={this.onContent} />
        </footer>
      </div>
    )
  }
}
Chat.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Chat)
