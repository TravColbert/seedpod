# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

# APP layer install stage - the module that runs on top of Seedpod base
FROM alpine/git AS app

# Vars available in the *build* stage
ARG APP_LIST
ARG APP_RELEASE
ARG APP_REPO
ARG APP_SOURCE_REPO

WORKDIR /app
RUN git clone --branch $APP_RELEASE --single-branch $APP_REPO ./
RUN sh ./jobs/job.sh $APP_SOURCE_REPO
# Finshed staging the app module

# APP layer build stage
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY --from=app /app .
RUN npm i --omit=dev

# The base layer stage
FROM node:${NODE_VERSION}-alpine

ARG APP_NAME
ARG APP_DESCRIPTION

ENV APP_NAME=$APP_NAME
ENV APP_DESCRIPTION=$APP_DESCRIPTION

# Vars available in the *build* stage
ENV NODE_ENV=production
ENV APP_LIST=app

WORKDIR /usr/src/app

# Copy the APP layer into the base layer
COPY --from=build /app ./app
# COPY --from=build /app/node_modules ./app/node_modules

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=cache,id=npm-cache,target=/root/.npm \
  npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8080
EXPOSE 8443

# Run the application.
ENTRYPOINT [ "npm", "start" ]
