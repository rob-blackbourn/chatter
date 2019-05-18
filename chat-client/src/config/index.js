const httpScheme = window.location.protocol
const wsScheme = httpScheme === 'https:' ? 'wss:' : 'ws:'
const host = window.location.host
const apiPathPrefix = '/chatter/api'
const httpApiPrefix = `${httpScheme}//${host}${apiPathPrefix}`
const wsApiPrefix = `${wsScheme}//${host}${apiPathPrefix}`

const authenticateEndpoint = `${httpApiPrefix}/authenticate`
const registerEndpoint = `${httpApiPrefix}/register`
const graphqlQueryEndpoint = `${httpApiPrefix}/graphql`
const graphqlSubscriptionEndpoint = `${wsApiPrefix}/subscriptions`

export default {
  authenticateEndpoint,
  registerEndpoint,
  graphqlQueryEndpoint,
  graphqlSubscriptionEndpoint
}
