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

export function sendMessage (content, signal, onError, onSuccess) {
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
    signal
  })
    .then(response => {
      return response.json()
    })
    .then(response => {
      onSuccess(response)
    })
    .catch(error => {
      onError(error)
    })
}

export function fetchChats (startDate, endDate, signal, onError, onSuccess) {
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
  const variables = { startDate, endDate }
  const operationName = null

  graphQLFetch(url, query, variables, operationName, {
    ...fetchOptions,
    signal
  })
    .then(response => {
      return response.json()
    })
    .then(response => {
      console.log(response.data)
      onSuccess(response)
    })
    .catch(error => {
      onError(error)
    })
}

export function subscribe (onError, onSuccess) {
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
      onError(error)
    } else {
      subscribe(query, variables, operationName, (error, response) => {
        if (!(error || response)) {
          // No more data
          return
        }
        if (error) {
          onError(error)
        } else {
          onSuccess(response)
        }
      })
    }
  })
}
