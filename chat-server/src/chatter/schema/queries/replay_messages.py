from graphql import (
    GraphQLField,
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLArgument
)

from ..types import ChatMessageType

from ...resolvers.queries import replay_messages

ReplayMessagesQuery = GraphQLField(
    GraphQLList(ChatMessageType),
    {
        'startDate': GraphQLArgument(GraphQLNonNull(GraphQLString)),
        'endDate': GraphQLArgument(GraphQLNonNull(GraphQLString)),
        'maxMessages': GraphQLArgument(GraphQLInt, default_value=5)
    },
    replay_messages
)
