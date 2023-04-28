FROM node:14.15.4
WORKDIR /mezz
ARG NODE_ENV         
ENV NODE_ENV=production
ARG HOST         
ENV HOST=host.docker.internal
ARG PORT         
ENV PORT=7000
COPY package.json /mezz
RUN npm install 
COPY . /mezz
CMD ["npm", "run", "prod"]




