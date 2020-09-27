-- migrate:up

CREATE TABLE form
(
    id      bigserial primary key,
    name    text  not null,
    version int   not null default 1,
    schema  jsonb not null default '{}',
    def     jsonb not null default '{}'
);

CREATE TABLE response
(
    id           bigserial primary key,
    form_id      bigint not null,
    form_version bigint not null,
    data         jsonb  not null,
    source       text,

    CONSTRAINT "response_form" FOREIGN KEY (form_id) REFERENCES form (id)
);


-- migrate:down

DROP TABLE response;
DROP TABLE form;

