from graphql import (
    GraphQLObjectType
)

from .listen_to_messages import ListenToMessagesSubscription

RootSubscriptionType = GraphQLObjectType(
    "Subscriptions",
    {
        'listenToMessages': ListenToMessagesSubscription
    },
)

__all__ = ['RootSubscriptionType']
