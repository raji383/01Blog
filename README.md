docker run --name blog-mysql \
  -e MYSQL_ROOT_PASSWORD=123 \
  -e MYSQL_DATABASE=blog_db \
  -v ${PWD}/mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  -d mysql:latest

# 1. Dkhoul l-container dial MySQL
docker exec -it blog-mysql mysql -u root -p123 blog_db

# 2. (Dakhel l-mysql) Chouf l-jdawel li 3ndek
SHOW TABLES;

# 3. Chouf l-data dial l-users (mat-nsach l-fasila l-manqouta ;)
SELECT * FROM users;