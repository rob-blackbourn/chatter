from graphql import (
    GraphQLField,
    GraphQLNonNull,
    GraphQLString,
    GraphQLList,
    GraphQLArgument
)

from ..types import ChatMessageType

from ...resolvers.queries import replay_messages

ReplayMessagesQuery = GraphQLField(
    GraphQLList(ChatMessageType),
    {
        'startDate': GraphQLArgument(GraphQLNonNull(GraphQLString)),
        'endDate': GraphQLArgument(GraphQLNonNull(GraphQLString))
    },
    replay_messages
)
