# שלב 1: Build
FROM node:18 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# שלב 2: Serve with nginx
FROM nginx:alpine

# העתק את ה-build לתיקיית nginx
COPY --from=build /app/build /usr/share/nginx/html

# הסר קובץ config ברירת מחדל
RUN rm /etc/nginx/conf.d/default.conf

# העתק קובץ קונפיג נינג'ינקס משלך
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
