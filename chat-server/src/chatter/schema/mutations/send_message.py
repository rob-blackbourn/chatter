from graphql import (
    GraphQLField,
    GraphQLArgument,
    GraphQLString
)

from ...resolvers.mutations import send_message

SendMessageMutation = GraphQLField(
    GraphQLString,
    {
        'content': GraphQLArgument(GraphQLString)
    },
    send_message
)
