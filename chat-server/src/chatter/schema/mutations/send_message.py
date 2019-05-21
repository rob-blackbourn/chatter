from graphql import (
    GraphQLField,
    GraphQLArgument,
    GraphQLString
)

from ..types import ChatMessageType
from ...resolvers.mutations import send_message

SendMessageMutation = GraphQLField(
    ChatMessageType,
    {
        'content': GraphQLArgument(GraphQLString)
    },
    send_message
)
