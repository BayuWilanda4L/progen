# ProGen - a ChatGPT Alternative

Progen - a ChatGPT Alternative
## Demo

Demo: [https://demo.progen-ai.cloud](https://demo.progen-ai.cloud)


## Usage
This project was bootstrapped with [Vite](https://vitejs.dev/).
### Project setup
```
npm install
```

This project utilizes the **Realtime Firebase Database** to store chat history. The API key is not stored.

Initially, you will need to install all the packages using the **npm install** command, followed by creating a new **web project** on the **Firebase Console**. After that, navigate to the project, open the All Products menu on the sidebar, and click on the Realtime Database option. Follow the instructions provided and then copy the configuration. Finally, create a new file named **firebase.jsx** inside the **src/config** directory. And **firebase.jsx** should be like this:

```
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "@firebase/database";

const firebaseConfig = {
    apiKey: "***",
    authDomain: "***",
    databaseURL: "***",
    projectId: "***",
    storageBucket: "***,
    messagingSenderId: "***",
    appId: "***",
    measurementId: "***"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
const analytics = getAnalytics(app);
```


#### Compiles and hot-reloads for development
```
npm run dev
```

#### Compiles and minifies for production
```
npm run build
```

## About Me

I'm an Indonesian developer who loves building mobile apps using React Native and web apps using ReactJS.
