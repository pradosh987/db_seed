import * as _ from "lodash";
import { faker } from "@faker-js/faker";

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "user",
    password: "user",
    database: "my_db",
  },
});

const seed = async () => {
  console.log("Seeding");

  await Promise.all(
    ["customers", "products", "variants", "bookings", "payments"].map(
      (table) => {
        return knex.raw(`truncate table ${table} cascade;`);
      }
    )
  );

  await seedCustomers();

  await seedProducts();

  await seedBookings();

  console.log("Seeding completed");
};

const seedCustomers = async () => {
  console.log("Seeding customers");
  await Promise.all(
    _.range(1, 1000).map(async (i) => {
      const customers = _.range(0, 1000).map(() => ({
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
      }));
      return knex("customers").insert(customers);
    })
  );
};

const seedProducts = () => {
  console.log("Seeding products");
  return Promise.all(
    _.range(1, 5000).map(async () => {
      const productData = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };
      const product = await knex("products").insert(productData).returning("*");
      // console.log({ product });
      const variantsData = _.range(1, _.random(5)).map(() => {
        return {
          product_id: product[0].id,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(),
        };
      });

      if (variantsData.length) {
        await knex("variants").insert(variantsData);
      }
    })
  );
};

const seedBookings = async () => {
  console.log("Seeding bookings");
  const bookingStates = [
    "payment_due",
    "confirmed",
    "confirmation_pending",
    "completed",
    "cancelled",
  ];
  return Promise.all(
    _.range(0, 100).map(async () => {
      const customerIds = await knex("customers")
        .select("id")
        .orderByRaw("random()")
        .limit(1000)
        .then((res: any) => res.map((r: any) => r.id));

      const variants = await knex("variants")
        .orderByRaw("random()")
        .limit(1000);

      const bookingsData = customerIds.map((customerId: string) => {
        const variant = _.sample(variants);
        return {
          customer_id: customerId,
          variant_id: variant.id,
          product_id: variant.product_id,
          state: _.sample(bookingStates),
          amount: variant.price,
        };
      });

      const bookings = await knex("bookings")
        .insert(bookingsData)
        .returning("*");

      const paymentsData = bookings.map((b: any) => {
        return {
          booking_id: b.id,
          amount: b.amount,
          state: ["confirmed", "confirmation_pending", "completed"].includes(
            b.state
          )
            ? "paid"
            : b.state === "cancelled"
            ? "refunded"
            : "initiated",
        };
      });

      await knex("payments").insert(paymentsData);
    })
  );
};

seed().catch(console.error).finally(process.exit);
