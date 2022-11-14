import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { ApolloServer } from "apollo-server";
import { gql } from "apollo-server";


const typeDefs = gql `
type User {
  user_id: ID! @id
  firstname: String
  lastname: String
  username: String!
  password: String!
  balance: Int! @default(value:1000)
  accums: [Accum!]! @relationship(type: "OWNER", direction: OUT)
}
  
type Accum {
  accum_id: ID! @id
  stake: Int
  user: User! @relationship(type: "OWNER", direction: IN)
  total_odds: Float
  bet_options: [BetOption!]! @relationship(type: "PLACED_OPTIONS", properties: "userOdds", direction: OUT)
}
  
type Bet {
  bet_id: ID! @id
  title: String!
  category: String
  bet_status: Int! @default(value:1)
  bet_options: [BetOption!]! @relationship(type: "BETOPTIONS", direction: OUT)
}

interface userOdds @relationshipProperties {
  user_odds: Float
}

type BetOption {
  option_id: ID! @id
  bet: Bet! @relationship(type: "BETOPTIONS", direction: IN)
  option: String
  latest_odds: Float
  option_status: Int! @default(value:1)
  accums: [Accum!]! @relationship(type: "PLACED_OPTIONS", properties: "userOdds", direction: IN)
}

`


// Use type definitions
const schema = new Neo4jGraphQL({
  typeDefs,
});

const driver = neo4j.driver(
  //prod server
  // "bolt://it2810-09.idi.ntnu.no:7687",
  // docker
  "bolt://localhost:7999",
  neo4j.auth.basic("neo4j", "password")
);

function context({ event, context }: { event: any; context: any }): any {
  return {
    event,
    context,
    driver,
  };
}

schema.getSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});

// ** ONLY if using docker: uncomment this **

// const session = driver.session();
// try {
//   const result = await session.run(`
//         LOAD CSV WITH HEADERS FROM 'file:///countryData.csv' AS row
//         MERGE (c:Country {name: row.Name, area: toFloat(row.Area), capital: coalesce(row.Capital, "none"), continent: row.Continent, flag: row.Flag, languages: coalesce(split(row.Languages, '|'), []), population: toInteger(row.Population), borders: coalesce(split(row.Borders, '|'), [])})
//     `);
// } finally {
//   await session.close();
// }


// // EXPRESS BELOW
// import express from 'express';

// const app = express()
// const port = 5555;

// app.use(express.json());

// app.post('/api/updateBet', (req, res) => {
//   console.log(req.body);
//   // res.json({
//   //   email: faker.internet.email(),
//   //   name: faker.name.findName(),
//   // });
// });

// app.listen(port, () => console.log(`HTTP server is listening on http://localhost:${port}`));
