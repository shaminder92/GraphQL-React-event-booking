const express = require("express");
const bodyParser = require("body-parser");
const grapgqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  grapgqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date:String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery{
            events: [Event!]!
        }


        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: (args) => {
        return bcrypt
          .hash(args, userInput.password, 12)
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, _id: result.id };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

const dbUrl = `mongodb+srv://${process.env.MONGO_USER}:mundi123@cluster0-nmbov.mongodb.net/events-react-dev?retryWrites=true&w=majority`;

console.log("\n\n log", dbUrl);

mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
