import React from "react";
import { ApolloConsumer } from "@apollo/client";
import { GET_CURRENT_USER } from "../../../../apollo/queries/currentUser";

export const UserConsumer = ({ children }) => {
  //   console.log("UserConsumer_children1: ", children);
  return (
    <ApolloConsumer>
      {(client) => {
        const result = client.readQuery({ query: GET_CURRENT_USER });
        // console.log("UserConsumer_children2: ", children);
        // console.log("UserConsumer_result: ", result);
        return React.Children.map(children, function (child) {
          // console.log("UserConsumer_child: ", child);
          return React.cloneElement(child, {
            user: result?.currentUser ? result.currentUser : null,
          });
        });
      }}
    </ApolloConsumer>
  );
};
