/*
* If you don't have an SQL Table to view, run this SQL once you have done the following:
* - Install Postgres (preferably 13)
* - Create a user `pg_web_client` with the password `pg_web_client`
* - Create a database `pg_web_client_demo`
*
* Run the following command once you are in current directory:
* `psql -U pg_web_client -d pg_web_client_demo -f demo_database.sql`
*/
CREATE SCHEMA supplier AUTHORIZATION pg_web_client;
CREATE SCHEMA inventory AUTHORIZATION pg_web_client;
CREATE SCHEMA customer AUTHORIZATION pg_web_client;

CREATE TABLE supplier.supplier_company
(
  company_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  CONSTRAINT supplier_company_id_pk PRIMARY KEY (company_id),
  CONSTRAINT supplier_company_name_unique UNIQUE (company_name)
);
ALTER TABLE supplier.supplier_company
  OWNER TO pg_web_client;

CREATE TABLE supplier.shipping_company
(
  company_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  CONSTRAINT shipping_company_id_pk PRIMARY KEY (company_id),
  CONSTRAINT shipping_company_name_unique UNIQUE (company_name)
);
ALTER TABLE supplier.shipping_company
  OWNER TO pg_web_client;

CREATE TABLE supplier."order"
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  supplier_company_id uuid, -- can be null if you delete supplier
  shipping_company_id uuid, -- can be null if you delete shipping company
  purchase_date timestamp with time zone NOT NULL DEFAULT now(),
  delivery_date timestamp with time zone, -- can have a null delivery date if delivery hasn't happened yet
  CONSTRAINT order_id_pk PRIMARY KEY (id),
  CONSTRAINT order_supplier_company_id_fk FOREIGN KEY (supplier_company_id) REFERENCES supplier.supplier_company (company_id) ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT order_shipping_company_id_fk FOREIGN KEY (shipping_company_id) REFERENCES supplier.shipping_company (company_id) ON UPDATE NO ACTION ON DELETE SET NULL
);
ALTER TABLE supplier."order"
  OWNER TO pg_web_client;

CREATE TABLE inventory.category
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  CONSTRAINT category_id_pk PRIMARY KEY (id),
  CONSTRAINT category_name_unique UNIQUE (name)
);
ALTER TABLE inventory.category
  OWNER TO pg_web_client;

CREATE TABLE inventory.stock
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL,
  order_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT stock_id_pk PRIMARY KEY (id),
  CONSTRAINT stock_category_id_fk FOREIGN KEY (category_id) REFERENCES inventory.category (id) ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT stock_order_id_fk FOREIGN KEY (order_id) REFERENCES supplier."order" (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
ALTER TABLE inventory.stock
  OWNER TO pg_web_client;

CREATE TYPE customer.transaction_action AS ENUM ('purchase', 'return');
ALTER TYPE customer.transaction_action
  OWNER TO pg_web_client;

CREATE TYPE customer.transaction_facilitator AS ENUM ('credit card', 'debit card', 'cash');
ALTER TYPE customer.transaction_facilitator
  OWNER TO pg_web_client;

CREATE TABLE customer.transaction
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  stock_id uuid NOT NULL,
  transaction_date timestamp with time zone NOT NULL DEFAULT now(),
  transaction_action customer.transaction_action NOT NULL,
  transaction_facilitator customer.transaction_facilitator NOT NULL,
  CONSTRAINT transaction_id_pk PRIMARY KEY (id),
  CONSTRAINT transaction_stock_id_fk FOREIGN KEY (stock_id) REFERENCES inventory.stock (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
ALTER TABLE customer.transaction
  OWNER TO pg_web_client;


/* data for the tables */

INSERT INTO supplier.supplier_company(company_id, company_name) VALUES
  ('7860ffe5-6659-48ae-ade9-b3e34d341eb2', 'Produce Hut'),
  ('2699366d-4a20-4e27-af96-8377592eb16a', 'Basic Needs Limited'),
  ('e8341b40-7a47-4d08-8135-895cee3568d6', 'Big Boy Butchery');

INSERT INTO supplier.shipping_company(company_id, company_name) VALUES
  ('85daac3f-fa9e-484f-b014-bc9b81435a28', 'Movement Shipping Co.'),
  ('bd04f775-fbc4-47d9-a559-63bcb335ab7f', 'Trans Canada Logistics'),
  ('fe0d8a53-518b-4295-8daf-d904d6198241', 'The Green Truckers');

INSERT INTO supplier.order(id, supplier_company_id, shipping_company_id, purchase_date, delivery_date) VALUES
  ('9eb40f9c-1b80-49a0-92a1-1ae328fed27a', '7860ffe5-6659-48ae-ade9-b3e34d341eb2', 'fe0d8a53-518b-4295-8daf-d904d6198241', now() - interval '48 hours', now()),
  ('470897d9-a14b-4a30-b155-66bf1baef233', '7860ffe5-6659-48ae-ade9-b3e34d341eb2', 'fe0d8a53-518b-4295-8daf-d904d6198241', now() - interval '48 hours', now()),
  ('5f0e4257-f19a-4f52-ad3a-fa7ef0c8ecf8', '7860ffe5-6659-48ae-ade9-b3e34d341eb2', 'fe0d8a53-518b-4295-8daf-d904d6198241', now() - interval '48 hours', now()),
  ('c6b64bc4-68ac-44f5-b3b5-106ff2979083', '7860ffe5-6659-48ae-ade9-b3e34d341eb2', 'fe0d8a53-518b-4295-8daf-d904d6198241', now() - interval '48 hours', now()),

  ('5b3e2f0a-e4b2-4952-910d-d188325e811f', 'e8341b40-7a47-4d08-8135-895cee3568d6', '85daac3f-fa9e-484f-b014-bc9b81435a28', now() - interval '24 hours', null),
  ('c6a7801f-74ac-4faa-8188-b0c4232978bc', 'e8341b40-7a47-4d08-8135-895cee3568d6', '85daac3f-fa9e-484f-b014-bc9b81435a28', now() - interval '24 hours', null),

  ('3eb11b89-9a4e-4bea-bed4-86be2d957167', '2699366d-4a20-4e27-af96-8377592eb16a', 'bd04f775-fbc4-47d9-a559-63bcb335ab7f', now() - interval '36 hours', now() - interval '12 hours'),
  ('f7b85d2b-bae2-45e6-b33a-b98762006b9b', '2699366d-4a20-4e27-af96-8377592eb16a', 'bd04f775-fbc4-47d9-a559-63bcb335ab7f', now() - interval '36 hours', now() - interval '12 hours'),
  ('7cf6ced4-6e24-4b9e-b678-b58dc52c0a7e', '2699366d-4a20-4e27-af96-8377592eb16a', 'bd04f775-fbc4-47d9-a559-63bcb335ab7f', now() - interval '36 hours', now() - interval '12 hours');

INSERT INTO inventory.category(id, name) VALUES
  ('2d58835c-050c-4df3-b0ac-c3969831c648', 'produce'),
  ('388071bb-edf4-4530-8506-40807c0e4439', 'dairy'),
  ('5d39574e-7f28-4812-83e5-84bcabd13ba0', 'meat'),
  ('b4c6bdad-d17c-4a67-882b-8fd7edd543ea', 'frozen food'),
  ('b9327f4b-f02f-4db7-9c19-dab7308163f1', 'packaged food'),
  ('bcbcd767-76fc-4f9b-be06-b7ba74c81596', 'supplements'),
  ('be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', 'cleaning supplies'),
  ('dd4a6019-dd45-45a7-b271-c50720c387fb', 'utility');

INSERT INTO inventory.stock(id, category_id, order_id, name) VALUES
  ('20ccce4e-44f0-40d7-be31-6fd474854421', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('342dff32-f553-4969-bc8e-031e23f6c19d', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('69c66abe-6965-4c89-956b-6f86e7165590', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('d7369e02-9a0e-4ea6-90df-24b02a560653', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('61cbb286-0e52-404b-8e8d-2ee6ec1a1368', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('21046306-cf03-4c07-9128-80b702209e7c', '2d58835c-050c-4df3-b0ac-c3969831c648', '9eb40f9c-1b80-49a0-92a1-1ae328fed27a', 'lettuce'),
  ('0de8c100-246e-4d89-b505-d9422ce138b2', '2d58835c-050c-4df3-b0ac-c3969831c648', '470897d9-a14b-4a30-b155-66bf1baef233', 'apple'),
  ('b6893f48-94b4-4c31-9821-c4376a69c734', '2d58835c-050c-4df3-b0ac-c3969831c648', '470897d9-a14b-4a30-b155-66bf1baef233', 'apple'),
  ('a0e23556-d760-401d-ac25-4f72ab4c7fd3', '2d58835c-050c-4df3-b0ac-c3969831c648', '5f0e4257-f19a-4f52-ad3a-fa7ef0c8ecf8', 'tomato'),
  ('890f2bf1-6220-4fcb-a417-f4e5e720d49c', '2d58835c-050c-4df3-b0ac-c3969831c648', '5f0e4257-f19a-4f52-ad3a-fa7ef0c8ecf8', 'tomato'),
  ('72973298-da64-4e72-b5c0-c65bcb1ca6d4', '2d58835c-050c-4df3-b0ac-c3969831c648', '5f0e4257-f19a-4f52-ad3a-fa7ef0c8ecf8', 'tomato'),
  ('148d0044-aced-4953-b9bf-944b41641af8', '2d58835c-050c-4df3-b0ac-c3969831c648', 'c6b64bc4-68ac-44f5-b3b5-106ff2979083', 'pineapple'),

  ('53a2f5b2-1996-4138-a3da-57872718aa3f', '5d39574e-7f28-4812-83e5-84bcabd13ba0', '5b3e2f0a-e4b2-4952-910d-d188325e811f', 'whole chicken'),
  ('bcf6523f-ccb3-45ac-88dd-3a393a44da65', '5d39574e-7f28-4812-83e5-84bcabd13ba0', '5b3e2f0a-e4b2-4952-910d-d188325e811f', 'whole chicken'),
  ('7b50919e-149f-410d-9036-5ce00d1ed2d2', '5d39574e-7f28-4812-83e5-84bcabd13ba0', 'c6a7801f-74ac-4faa-8188-b0c4232978bc', 'ham'),
  ('5556bec9-0d11-45ec-980a-1c9b108a2022', '5d39574e-7f28-4812-83e5-84bcabd13ba0', 'c6a7801f-74ac-4faa-8188-b0c4232978bc', 'ham'),

  ('1d7f9c5c-90de-4361-a6a7-7787d400a9f0', 'be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', '3eb11b89-9a4e-4bea-bed4-86be2d957167', 'mop'),
  ('2cdf659f-6ebd-4316-a0f7-333b61ee3ad7', 'be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', '3eb11b89-9a4e-4bea-bed4-86be2d957167', 'mop'),
  ('bae3f953-ad2e-4d9a-ac9b-ebd6f4407149', 'be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', 'f7b85d2b-bae2-45e6-b33a-b98762006b9b', 'laundry detergent'),
  ('37864c6f-daef-4724-9079-70c746d593fa', 'be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', 'f7b85d2b-bae2-45e6-b33a-b98762006b9b', 'laundry detergent'),
  ('ad40b1aa-5088-4c5a-b0a1-8129e5b7bef8', 'be7e02b1-f0fa-4dc8-ba12-60630d8ea2c4', 'f7b85d2b-bae2-45e6-b33a-b98762006b9b', 'laundry detergent'),
  ('2fc1a717-1244-46ab-bead-4d3e0b8afd9c', 'dd4a6019-dd45-45a7-b271-c50720c387fb', '7cf6ced4-6e24-4b9e-b678-b58dc52c0a7e', '4-pack AA batteries'),
  ('fd90534b-d8fa-46d9-90ba-bab577b75a47', 'dd4a6019-dd45-45a7-b271-c50720c387fb', '7cf6ced4-6e24-4b9e-b678-b58dc52c0a7e', '4-pack AA batteries');

INSERT INTO customer.transaction(id, stock_id, transaction_date, transaction_action, transaction_facilitator) VALUES
  (public.uuid_generate_v4(), '148d0044-aced-4953-b9bf-944b41641af8', now() - interval '2 hours', 'purchase', 'cash'),
  (public.uuid_generate_v4(), '1d7f9c5c-90de-4361-a6a7-7787d400a9f0', now() - interval '2 hours', 'purchase', 'cash'),
  (public.uuid_generate_v4(), '1d7f9c5c-90de-4361-a6a7-7787d400a9f0', now() - interval '2 hours', 'return', 'cash'),
  (public.uuid_generate_v4(), '53a2f5b2-1996-4138-a3da-57872718aa3f', now() - interval '2 hours', 'purchase', 'credit card'),
  (public.uuid_generate_v4(), '7b50919e-149f-410d-9036-5ce00d1ed2d2', now() - interval '2 hours', 'purchase', 'debit card');
