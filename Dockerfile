FROM node:22 AS build-stage
WORKDIR /app
COPY vue-project/package.json vue-project/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./vue-project .
RUN yarn build

FROM nginx AS production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

COPY docker-entry.sh /
RUN chmod +x /docker-entry.sh

# Expose port 80 and start server
EXPOSE 80
CMD ["/docker-entry.sh"]
