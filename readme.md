Install nodejs 16x, create database, change config in seed.ts and run following commands.

```sql
CREATE TABLE customers
(
    id         bigserial primary key,
    first_name varchar(255)                not null,
    last_name  varchar(255)                not null,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now()
);

create table products
(
    id          bigserial primary key,
    name        varchar(255)                not null,
    description text,
    created_at  timestamp without time zone not null default now(),
    updated_at  timestamp without time zone not null default now()
);

create table variants
(
    id          bigserial primary key,
    product_id  bigint references products  not null,
    name        varchar(255)                not null,
    price       decimal                     not null,
    description text,
    created_at  timestamp without time zone not null default now(),
    updated_at  timestamp without time zone not null default now()
);

create table bookings
(
    id         bigserial primary key,
    product_id bigint references products  not null,
    variant_id bigint references variants  not null,
    customer_id bigint references customers  not null,
--     State can be one of created, payment_due, confirmed, cancelled
    state      varchar(20)                 not null default 'created',
    amount     decimal                     not null,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now()
);

create table payments
(
    id         bigserial primary key,
    booking_id bigint references bookings  not null,
    amount     decimal                     not null,
    --     State can be one of created, successful, failed, refunded
    state      varchar(20)                 not null default 'created',
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now()
);

alter table payments
    add foreign key (booking_id) references bookings (id);
```

```
npm i
npx ts-node seed.ts
```