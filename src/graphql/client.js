import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';


const headers = { 'x-hasura-admin-secret': 'projectagram21' }

const client = new ApolloClient({
    link: new WebSocketLink({
        uri: 'wss://projectagram.hasura.app/v1/graphql',
        options: {
            reconnect: true,
            connectionParams: {
                headers
            }
        }

    }),
    cache: new InMemoryCache()
})

export default client;