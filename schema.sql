drop table if  exists recipe;
drop table if exists comments;
create table if not exists recipe (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    recipename VARCHAR(255),
    img_url VARCHAR(1000),
    ingredient text,
    time  VARCHAR(255),
    serving VARCHAR(255),
    instuctions text
);
create table commenttable(
  id SERIAL PRIMARY KEY,
  comments VARCHAR(1000),
  secid VARCHAR(255)
);
