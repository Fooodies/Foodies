drop table if  exists recipe;

create table if not exists recipe (
      id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    recipename VARCHAR(255),
    img_url VARCHAR(1000),
    ingredient VARCHAR(255),
    time  VARCHAR(255),
    serving VARCHAR(255),
    instuctions text
)