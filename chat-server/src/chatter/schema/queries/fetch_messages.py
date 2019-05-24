from graphql import (
    GraphQLField,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLArgument
)

from ..types import ChatMessageType

from ...resolvers.queries import fetch_messages

FetchMessagesQuery = GraphQLField(
    GraphQLList(ChatMessageType),
    {
        'count': GraphQLArgument(GraphQLNonNull(GraphQLInt)),
        'timestamp': GraphQLArgument(GraphQLString)
    },
    fetch_messages
)
