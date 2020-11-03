import * as lodash from "lodash";
import { SimpleDataLoader } from "./simple-data-loader";

const DataLoader = require("dataloader");

interface User {
  name: string;
  friends: string[];
}

const usersById: { [k in string]?: User } = {
  "1": { name: "Bob", friends: ["2", "3"] },
  "2": { name: "Bill", friends: ["1", "3"] },
  "3": { name: "Bo", friends: ["1", "2"] },
};

// TODO: handle optional case?
async function getUsers(ids: string[]): Promise<(User | undefined)[]> {
  console.log("getting users for ids", ids);
  return Promise.resolve(ids.map((id) => usersById[id]));
}

async function run() {
  // Designed to be short lived
  const userDataLoader = new DataLoader(getUsers);

  // Batching
  const userOne = userDataLoader.load("1");
  const userTwo = userDataLoader.load("2");
  const userThree = userDataLoader.load("3");

  const users = await Promise.all([userOne, userTwo, userThree]);
  console.log("users", users);

  // Memoization
  // const userOneAgain = await userDataLoader.load("1");
  // console.log("user one again", userOneAgain);

  // const notFoundUser = await userDataLoader.load('345');
  // console.log("not found user", notFoundUser);

  // Batching optimization
  // const allUsersFriends = await Promise.all(
  //   lodash.flatMap(users, (user) =>
  //     user.friends.map((friendId) => userDataLoader.load(friendId))
  //   )
  // );
  // console.log("all users friends", allUsersFriends);
}

async function runSimple() {
  const userDataLoader = new SimpleDataLoader(getUsers);

  const userOne = userDataLoader.load("1");
  const userTwo = userDataLoader.load("2");

  const users = await Promise.all([userOne, userTwo]);
  console.log("users", users);
}

run();
