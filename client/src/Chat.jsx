import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

import { Container, Row, Col, FormInput, Button } from 'shards-react';

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (data) {
    return (
      <>
        {data.messages.map(({ id, user: messageUser, content }) => (
          <div
            key={id}
            style={{
              display: 'flex',
              justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
              paddingBottom: '1em',
            }}
          >
            {user !== messageUser && (
              <div
                style={{
                  height: 50,
                  width: 50,
                  marginRight: '0.5em',
                  border: '2px solid #e5e6ea',
                  borderRadius: 25,
                  textAlign: 'center',
                  fontSize: '18pt',
                  paddingTop: 5,
                }}
              >
                {messageUser
                  .split(' ')
                  .map(name => name[0].toUpperCase())
                  .join('')}
              </div>
            )}
            <div
              style={{
                background: user === messageUser ? 'green' : 'grey',
                color: user === messageUser ? 'white' : 'black',
                padding: '1em',
                borderRadius: '1em',
                maxWidth: '60%',
                fontSize: '1rem',
              }}
            >
              {content}
            </div>
          </div>
        ))}
      </>
    );
  }

  return null;
};

const Chat = () => {
  const [state, setState] = React.useState({
    user: 'Admin',
    content: '',
  });

  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }

    setState({
      ...state,
      content: '',
    });
  };
  return (
    <div>
      <Container>
        <Messages user={state.user} />
        <Row>
          <Col xs={2} style={{ padding: 0 }}>
            <FormInput
              label='User'
              value={state.user}
              onChange={evt => setState({ ...state, user: evt.target.value })}
            ></FormInput>
          </Col>
          <Col xs={8}>
            <FormInput
              label='Content'
              value={state.content}
              onChange={evt => setState({ ...state, content: evt.target.value })}
              onKeyUp={evt => {
                if (evt.keyCode === 13) {
                  onSend();
                }
              }}
            ></FormInput>
          </Col>
          <Col xs={2} style={{ padding: 0 }}>
            <Button onClick={() => onSend()} style={{ width: '100%' }}>
              Send
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
