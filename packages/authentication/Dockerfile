FROM node:lts-alpine as build
WORKDIR /app

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG VITE_VIVALENCE_ADMIN_PATH
ARG VITE_VIVALENCE_USER_PATH


COPY package.json ./
RUN npm install --force --legacy-peer-deps

COPY . ./

RUN npm run build


FROM node:lts-alpine as runtime
WORKDIR /app
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./

ENV NODE_ENV production
EXPOSE 5000

CMD [ "node", "index.js" ]
