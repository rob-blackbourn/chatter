import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { sendMessage, fetchMessages, subscribe } from '../api/chat'
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
    lastMessage: null,
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
    }), () => this.scrollToLastMessage('smooth'))
  }

  processQuery = (data) => {
    console.log(data)
    const messages = data.map(x => toMessage(x)).sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf())
    const hasMore = messages.length > 0
    const lastMessage = hasMore ? messages[messages.length - 1] : null
    this.setState(
      (state, props) => ({
        messages: [
          ...messages,
          ...state.messages
        ],
        hasMore,
        lastMessage,
        page: state.page + 1,
        isLoading: false
      }), () => {
        const { page } = this.state

        if (page === 1) {
          this.scrollToLastMessage({ behavior: 'smooth' })
        } else {
          this.scrollToLastMessage({ behavior: 'auto', alignToTop: false })
        }
      })
  }

  startQuery = () => {
    const { messages } = this.state

    const timestamp =
      messages.length === 0
        ? null
        : new Date(Math.min(...messages.map(x => x.timestamp.valueOf())))

    fetchMessages(10, timestamp, this.abortController.signal, console.error, this.processQuery)
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

  scrollToLastMessage = (options) => {
    if (this.lastMessageRef.current) {
      this.lastMessageRef.current.scrollIntoView(options)
    }
  }

  scrollListener = () => {
    if (this.bodyRef.current.scrollTop === 0) {
      if (this.state.hasMore) {
        this.loadMore()
      }
    }
  }

  componentDidMount () {
    this.scrollToLastMessage({ behavior: 'smooth' })
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
    const { messages, isLoading, lastMessage } = this.state

    return (
      <div className={classes.container}>
        <header className={classes.header}>
          <Typography variant='h2'>Chat</Typography>
        </header>

        <div className={classes.body} ref={this.bodyRef}>
          {isLoading
            ? <LinearProgress />
            : messages.map((message, index) => (
              <div>
                <ChatCard
                  key={index}
                  email={message.email}
                  timestamp={message.timestamp}
                  content={message.content}
                />
                {message === lastMessage ? <div key={messages.length} ref={this.lastMessageRef} /> : null}
              </div>
            ))}
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
