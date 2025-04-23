# Using nginx web-server
FROM nginx
# Install cron
RUN apt-get update && \
    apt-get install -y \
        cron \
        && \
    echo '#!/bin/bash\n\ncron && /docker-entrypoint.sh "$@"' >> entrypoint-wrapper.sh && \
    chmod +x /entrypoint-wrapper.sh
# Copy source code
COPY ../index.html /usr/share/nginx/html/
COPY ../backend /usr/share/nginx/html/backend
COPY ../frontend /usr/share/nginx/html/frontend
# Set environment variables (used by the lists script)
RUN (crontab -l ; echo "GITHUB_WORKSPACE=/usr/share/nginx/html") | crontab -
# Prepare cron files
RUN mkdir -p /etc/crontabs/app/
# Add cron task to update EPG
RUN chmod +x /usr/share/nginx/html/backend/scripts/epg.sh
RUN (crontab -l ; echo "0 * * * * cd /usr/share/nginx/html && ./backend/scripts/epg.sh > /tmp/epg.txt 2>&1") | crontab -
# Add cron task to update lists
RUN chmod +x /usr/share/nginx/html/backend/scripts/list.sh
RUN (crontab -l ; echo "0 * * * * cd /usr/share/nginx/html && ./backend/scripts/list.sh > /tmp/list.txt 2>&1") | crontab -
# Configure cron
ENTRYPOINT ["/entrypoint-wrapper.sh"]
# Have to reset CMD since it gets cleared when we set ENTRYPOINT
CMD ["nginx", "-g", "daemon off;"]
