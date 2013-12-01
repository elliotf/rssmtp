-- To create the DB and user in postgres
-- sudo -u postgres psql -f doc/create_psql_db.sql
CREATE USER rssmtp WITH PASSWORD 'put_your_own_password_here';
CREATE DATABASE rssmtp_development WITH OWNER rssmtp;
