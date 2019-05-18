from graphql import (
    GraphQLObjectType,
    GraphQLField,
    GraphQLNonNull,
    GraphQLString
)

ChatMessageType = GraphQLObjectType(
    'ChatMessageType',
    lambda: {
        'timestamp': GraphQLField(GraphQLNonNull(GraphQLString)),
        'email': GraphQLField(GraphQLNonNull(GraphQLString)),
        'content': GraphQLField(GraphQLString)
    }
)
