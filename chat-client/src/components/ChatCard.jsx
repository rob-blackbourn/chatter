import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

const styles = theme => ({
  card: {

  },
  header: {

  },
  content: {

  }
})

class ChatCard extends React.Component {
  render () {
    const { classes, key, email, timestamp, content } = this.props

    return (
      <Card key={key} className={classes.card}>
        <CardHeader
          className={classes.header}
          title={email}
          titleTypographyProps={{ variant: 'h5' }}
          subheader={timestamp.toLocaleString()}
        />
        <CardContent className={classes.content}>
          <Typography component='p'>{content}</Typography>
        </CardContent>
      </Card>
    )
  }
}
ChatCard.propTypes = {
  classes: PropTypes.object.isRequired,
  key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  email: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date),
  content: PropTypes.string.isRequired
}

export default withStyles(styles)(ChatCard)
