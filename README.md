# Seedpod

- [What is Seedpod?](#what-is-seedpod)
- [Installation](#installation)
- [Running](#running)
- [Documentation](#documentation)
- [Getting Help](#getting-help)
- [Contributing](#contributing)

## What is Seedpod?

Seedpod is a modest, no-magic Javascript web framework that prioritizes clarity, simplicity and a return to low-complexity web applications. It is small, fast and flexible.

## Installation

```sh
git clone git@github.com:TravColbert/node-express-starter.git
npm install
```

## Running

You can run your application locally for development using several ways:

1. **Node**
2. **NPM**
3. **Docker**
4. **Docker Compose**.

### Node

The most direct way is to run your application directly **node**:

```
node server
```

### NPM

There are also several **npm run command**s available:

#### Run the server with no restarts

```
npm run start
```

#### Run the server and restart when changes are detected

```
npm run dev
```

### Docker

You can run your application in Docker by:

#### Building a Docker Image

First, we build a fresh image that we can run or inspect later:

```
docker build \
--build-arg APP_TOKEN=[token] \
--build-arg APP_RELEASE=[tag] \
--build-arg APP_REPO=[url]
--no-cache -t [name] ./
```

Where:

- [token] : the optional security token that your app module requires to access data
- [tag] : the release tag for the app module you are implementing
- [url] : the URL to the repo of the app module you are implementing
- [name] : the name of the image for later reference

Here's another invokation using **Docker Compose**:

First, define APP_TOKEN, APP_LIST, etc. in an .env file, then:

```
docker compose up --build
```

#### Running the Container

Secondly, use this command to run the container:

```
# To run the container
docker run -p 8080:8080 [name]
```

Where

- [name] : the name of the image in the _build_ step, above.

#### Inspecting the Container

You can also inspect the inside of the container. This is especially useful if you are developing:

```
# To get a shell inside the container for debugging
docker run -it --entrypoint /bin/sh [name]
```

Where:

- [name] : the name of the image in the _build_ step, above.

### Docker Compose

You can also use **Docker Compose** to build and run the app.

Two extra things are required (and included) to start your app using Docker Composer:

1. An `.env` file specifying the environment variables imported into the build
1. A `compose.yml` configuring the application stack.

A minimal sample `.env` file would be:

```
APP_REPO=[url]
APP_RELEASE=[tag]
APP_TOKEN=[token]
```

The above `.env` simply specifies:

1. the application module's Git repo [url]
1. the data-access token (if required) [token]
1. the release [tag]

#### Building and running your application using Docker Compose

When you're ready, start your application by running:

```
docker compose up --build
```

With the default settings your application will be available at http://localhost:8080.
