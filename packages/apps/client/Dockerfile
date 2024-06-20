# FROM oven/bun:1-debian as build

# WORKDIR /app

# COPY ./../.. /app
# # RUN rm -rf /app/packages/app/admin /app/packages/postgres

# RUN bun install 
# WORKDIR /app/packages/apps/client
# RUN bun install
# RUN bun run build

# FROM oven/bun:1-debian as runtime
# WORKDIR /app
# COPY --from=build /app/packages/apps/client/build ./
# COPY --from=build /app/packages/apps/client/package.json ./
# COPY --from=build /app/node_modules ./node_modules

# ENV NODE_ENV production

# USER bun
# EXPOSE 3000/tcp
# # CMD [ "bun", "run", "index.js" ]
# ENTRYPOINT [ "bun", "run", "index.js" ]



# # COPY --from=build /app/node_modules ./node_modules
# # COPY --from=build /app/build ./
# # COPY --from=build /app/package.json ./

# # # COPY package.json yarn.lock ./
# # # RUN yarn install --frozen-lockfile

# # # Copy all packages and build the project
# # COPY . ./
# # RUN yarn workspace @vivalence/client build

# # FROM node:lts-alpine as runtime
# # WORKDIR /app
# # COPY --from=build /app/packages/apps/client/build ./
# # COPY --from=build /app/packages/apps/client/package.json ./
# # COPY --from=build /app/node_modules ./node_modules

