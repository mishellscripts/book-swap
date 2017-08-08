# Book Swap

## Overview

Book swap is an application where users can catalogue their books online and trade books with other users to maximize their reading experiences. 

Demo: https://book-swapp.herokuapp.com/

### User stories
1) I can view all books posted by every user.
2) I can add a new book.
3) I can update my settings to store my full name, city, and state.
4) I can propose a trade and wait for the other user to accept the trade.

### Significant technologies used:
- Back-end: Mongoose, ExpressJS, NodeJS, Passport
- Front-end: HTML (Pug), SCSS, AngularJS

## Prerequisites

You will need the following installed in order to proceed.

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [Git](https://git-scm.com/)

## Installation & Startup

Go to your preferred directory and enter the below in the terminal window:

```bash
$ git clone https://github.com/mishellscripts/book-swap.git
```

Next, install the dependencies:

```
$ cd your-project
$ npm install
```


## Setting up OAUTH authentication

In this application, I emitted most of the authentication methods that was provided in the starter skeleton code, leaving only Facebook and Google authentication.
Please follow [this readme](https://github.com/sahat/hackathon-starter/blob/master/README.md) to register the application with different OAuth authentication methods and to obtain the API ids / secrets.

## Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
MONGOLAB_URI=your-mongolab-uri-here
SESSION_SECRET=your-session-secret-here
```

Include the following for each OAuth method used:

```
ID=your-auth-id-here
SECRET=your-auth-secret-here
```

## Ready to Go

To start the app, make sure you're in the project directory and type `node app.js` into the terminal. This will start the Node server.

You should the following messages within the terminal window:

```
✓ App is running at http://localhost:3000 in development mode
  Press CTRL-C to stop
```

Next, open your browser and enter `http://localhost:3000/`. Congrats, you're up and running!
