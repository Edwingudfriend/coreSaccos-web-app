FROM nginx:alpine
COPY dist/web-app/browser /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
