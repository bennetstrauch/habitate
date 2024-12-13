import mongoose from 'mongoose';

//# specify database when calling?
export const connectToDB = () => {

  if (process.env.DB_URL) {
    mongoose.connect(process.env.DB_URL).then(() => {
      console.log("Successfully connected to MongoDB!");
    })
      .catch((error) =>
        console.error("Error connecting to MongoDB: ", error))
  } else {
    console.log('Connection string missing.')
  }

}
