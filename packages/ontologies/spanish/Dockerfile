# FROM oven/bun:1-debian as build

# WORKDIR /app

# COPY ./../.. /app
# # RUN rm -rf /app/packages/apps /app/packages/postgres

# RUN bun install 
# WORKDIR /app/packages/ontologies/spanish
# RUN bun install 

# FROM oven/bun:1-debian as runtime
# WORKDIR /app
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/packages/ontologies/spanish ./

# ENV NODE_ENV production

# USER bun
# EXPOSE 3000/tcp
# # ENTRYPOINT [ "bun", "run", "start" ]
# ENTRYPOINT ["tail", "-f", "/dev/null"]


# # CMD [ "bun", "run", "index.js" ]

# # FROM node:lts-alpine as build
# # WORKDIR /app

# # COPY package.json ./
# # RUN npm install --force --legacy-peer-deps

# # COPY . ./

# # RUN npm run build

# # FROM node:lts-alpine as runtime
# # WORKDIR /app
# # COPY --from=build /app/node_modules ./node_modules
# # COPY --from=build /app/build ./
# # COPY --from=build /app/package.json ./

# # ENV NODE_ENV production
# # EXPOSE 3000/tcp

# # CMD [ "node", "index.js" ]

