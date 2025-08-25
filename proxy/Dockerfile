FROM nginx:stable-alpine

COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80